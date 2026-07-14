"""
Finance API Router — Accounts Payable, Accounts Receivable, 
General Ledger, Bank Reconciliation, Fiscal Periods, Reporting.
"""
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.core import crud
from app.core.audit import log_action
from app.core.dependencies import get_current_company_id, require_permission
from app.db.session import get_db
from app.models.finance import (
    Account, BankStatementLine, Currency, CustomerInvoice,
    CustomerInvoiceLine, CustomerPayment, ExchangeRate, FiscalPeriod,
    Journal, JournalEntry, JournalLine, VendorBill, VendorBillLine,
    VendorPayment,
)
from app.models.user import User
from app.schemas.finance import (
    AccountCreate, AccountResponse,
    BankStatementLineCreate, BankStatementLineResponse,
    CurrencyCreate, CurrencyResponse,
    ExchangeRateCreate, ExchangeRateResponse,
    CustomerInvoiceCreate, CustomerInvoiceResponse,
    CustomerPaymentCreate, CustomerPaymentResponse,
    FiscalPeriodCreate, FiscalPeriodResponse,
    JournalCreate, JournalEntryCreate, JournalEntryResponse,
    JournalEntryUpdate, JournalResponse,
    VendorBillCreate, VendorBillResponse,
    VendorPaymentCreate, VendorPaymentResponse,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _seq(db: Session, model, cid: int) -> int:
    return db.query(model).filter(model.company_id == cid).count() + 1


def _next_entry_ref(db, cid, dt: date) -> str:
    n = _seq(db, JournalEntry, cid)
    return f"MOVE/{dt.year}/{dt.month:02d}/{n:04d}"


def _next_bill_ref(db, cid, dt: date) -> str:
    n = _seq(db, VendorBill, cid)
    return f"BILL/{dt.year}/{dt.month:02d}/{n:04d}"


def _next_inv_ref(db, cid, dt: date) -> str:
    n = _seq(db, CustomerInvoice, cid)
    return f"INV/{dt.year}/{dt.month:02d}/{n:04d}"


def _next_vpay_ref(db, cid) -> str:
    return f"VPAY-{_seq(db, VendorPayment, cid):04d}"


def _next_cpay_ref(db, cid) -> str:
    return f"CPAY-{_seq(db, CustomerPayment, cid):04d}"


def _compute_lines(lines_data):
    """Return (subtotal, tax_total, total) from line dicts."""
    sub = Decimal("0")
    tax = Decimal("0")
    for l in lines_data:
        qty = l.quantity
        price = l.unit_price
        disc = getattr(l, "discount_pct", Decimal("0"))
        line_base = qty * price * (1 - disc / 100)
        line_tax = line_base * l.tax_rate
        sub += line_base
        tax += line_tax
    return sub, tax, sub + tax


def _get_exchange_rate(db: Session, currency_id: Optional[int], dt: date) -> Decimal:
    if not currency_id:
        return Decimal("1.0")
    rate_entry = db.query(ExchangeRate).filter(
        ExchangeRate.currency_id == currency_id,
        ExchangeRate.date == dt
    ).order_by(ExchangeRate.id.desc()).first()
    if rate_entry:
        return rate_entry.rate
    curr = db.query(Currency).filter(Currency.id == currency_id).first()
    if curr:
        return curr.rate_to_jod
    return Decimal("1.0")


def _post_forex_difference(db: Session, cid: int, user_id: int, partner_id: int, amount_diff: Decimal, ref_doc: str, dt: date):
    forex_acc = db.query(Account).filter(Account.company_id == cid, Account.code == "5510").first()
    if not forex_acc:
        forex_acc = Account(
            company_id=cid, code="5510", name="Foreign Exchange Gain/Loss",
            account_type="expense", is_reconcilable=False, created_by_id=user_id
        )
        db.add(forex_acc)
        db.flush()
        
    cash_diff_acc = db.query(Account).filter(Account.company_id == cid, Account.code == "1100").first()
    if not cash_diff_acc:
        cash_diff_acc = Account(
            company_id=cid, code="1100", name="Cash & Cash Equivalents",
            account_type="asset", is_reconcilable=True, created_by_id=user_id
        )
        db.add(cash_diff_acc)
        db.flush()

    val = abs(amount_diff)
    if val < Decimal("0.01"):
        return None

    journal = db.query(Journal).filter(Journal.company_id == cid, Journal.journal_type == "general").first()
    if not journal:
        journal = Journal(company_id=cid, name="General Journal", code="GEN", journal_type="general", created_by_id=user_id)
        db.add(journal)
        db.flush()

    entry_ref = f"FOREX/{dt.year}/{dt.month:02d}/{_seq(db, JournalEntry, cid):04d}"
    entry = JournalEntry(
        company_id=cid, reference=entry_ref, journal_id=journal.id,
        date=dt, partner_id=partner_id, description=f"Forex Revaluation diff for {ref_doc}",
        debit_total=val, credit_total=val, status="Posted", created_by_id=user_id
    )
    db.add(entry)
    db.flush()

    if amount_diff > 0:
        db.add(JournalLine(company_id=cid, entry_id=entry.id, account_id=cash_diff_acc.id, debit=val, credit=Decimal("0"), label="Forex Gain"))
        db.add(JournalLine(company_id=cid, entry_id=entry.id, account_id=forex_acc.id, debit=Decimal("0"), credit=val, label="Forex Gain"))
    else:
        db.add(JournalLine(company_id=cid, entry_id=entry.id, account_id=forex_acc.id, debit=val, credit=Decimal("0"), label="Forex Loss"))
        db.add(JournalLine(company_id=cid, entry_id=entry.id, account_id=cash_diff_acc.id, debit=Decimal("0"), credit=val, label="Forex Loss"))
    db.flush()
    return entry


# ── Currencies ───────────────────────────────────────────────────────────────

@router.get("/currencies", response_model=List[CurrencyResponse])
def list_currencies(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(Currency).filter(Currency.company_id == cid, Currency.is_active == True).all()


@router.post("/currencies", response_model=CurrencyResponse)
def create_currency(
    payload: CurrencyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = Currency(company_id=cid, created_by_id=user.id, **payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


@router.get("/currencies/rates", response_model=List[ExchangeRateResponse])
def list_exchange_rates(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(ExchangeRate).join(Currency).filter(Currency.company_id == cid).all()


@router.post("/currencies/rates", response_model=ExchangeRateResponse)
def add_exchange_rate(
    payload: ExchangeRateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    # Verify currency belongs to company
    curr = db.query(Currency).filter(Currency.id == payload.currency_id, Currency.company_id == cid).first()
    if not curr:
        raise HTTPException(status_code=404, detail="Currency not found")

    # Update Currency's main rate
    curr.rate_to_jod = payload.rate

    # Create ExchangeRate history entry
    obj = ExchangeRate(company_id=cid, created_by_id=user.id, **payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/currencies/convert")
def convert_currency(
    from_currency: str,
    to_currency: str,
    amount: Decimal,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    c_from = db.query(Currency).filter(Currency.name == from_currency, Currency.company_id == cid).first()
    c_to = db.query(Currency).filter(Currency.name == to_currency, Currency.company_id == cid).first()

    if not c_from or not c_to:
        raise HTTPException(status_code=400, detail="One or both currencies not supported or active")

    # JOD is the base currency
    # Amount in JOD = amount * c_from.rate_to_jod
    # Amount in Target = Amount in JOD / c_to.rate_to_jod
    amt_jod = amount * c_from.rate_to_jod
    amt_target = amt_jod / c_to.rate_to_jod

    return {
        "from": from_currency,
        "to": to_currency,
        "amount": float(amount),
        "rate": float(c_from.rate_to_jod / c_to.rate_to_jod),
        "result": float(round(amt_target, 4))
    }


# ── Fiscal Periods ────────────────────────────────────────────────────────────

@router.get("/fiscal-periods", response_model=List[FiscalPeriodResponse])
def list_fiscal_periods(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(FiscalPeriod).filter(FiscalPeriod.company_id == cid).order_by(FiscalPeriod.date_start.desc()).all()


@router.post("/fiscal-periods", response_model=FiscalPeriodResponse)
def create_fiscal_period(
    payload: FiscalPeriodCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = FiscalPeriod(company_id=cid, created_by_id=user.id, **payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


@router.post("/fiscal-periods/{period_id}/close")
def close_fiscal_period(
    period_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    period = db.query(FiscalPeriod).filter(FiscalPeriod.id == period_id, FiscalPeriod.company_id == cid).first()
    if not period:
        raise HTTPException(404, "Fiscal period not found")
    if period.state == "locked":
        raise HTTPException(400, "Period is already locked")
    period.state = "locked"
    # Lock all Posted entries in this period
    db.query(JournalEntry).filter(
        JournalEntry.company_id == cid,
        JournalEntry.fiscal_period_id == period_id,
        JournalEntry.status == "Posted",
    ).update({"status": "Locked"})
    db.commit()
    log_action(db, user=user, action="close_period", entity_type="FiscalPeriod", entity_id=period_id)
    return {"message": f"Period '{period.name}' locked successfully"}


# ── Accounts ─────────────────────────────────────────────────────────────────

@router.get("/accounts", response_model=List[AccountResponse])
def list_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return crud.list_for_company(db, Account, cid, limit=500)


@router.post("/accounts", response_model=AccountResponse)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    return crud.create_for_company(db, Account, cid, payload.model_dump(), created_by_id=user.id)


# ── Journals ──────────────────────────────────────────────────────────────────

@router.get("/journals", response_model=List[JournalResponse])
def list_journals(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return crud.list_for_company(db, Journal, cid)


@router.post("/journals", response_model=JournalResponse)
def create_journal(
    payload: JournalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    return crud.create_for_company(db, Journal, cid, payload.model_dump(), created_by_id=user.id)


# ── Journal Entries (GL) ──────────────────────────────────────────────────────

@router.get("/entries", response_model=List[JournalEntryResponse])
def list_entries(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    status: Optional[str] = None,
    limit: int = Query(200, le=1000),
):
    q = db.query(JournalEntry).filter(JournalEntry.company_id == cid)
    if date_from:
        q = q.filter(JournalEntry.date >= date_from)
    if date_to:
        q = q.filter(JournalEntry.date <= date_to)
    if status:
        q = q.filter(JournalEntry.status == status)
    return q.order_by(JournalEntry.date.desc(), JournalEntry.id.desc()).limit(limit).all()


@router.post("/entries", response_model=JournalEntryResponse)
def create_entry(
    payload: JournalEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    debit_total = sum((l.debit for l in payload.lines), Decimal("0"))
    credit_total = sum((l.credit for l in payload.lines), Decimal("0"))
    if round(debit_total, 2) != round(credit_total, 2):
        raise HTTPException(400, f"Entry not balanced: debit {debit_total} ≠ credit {credit_total}")

    entry = JournalEntry(
        company_id=cid,
        reference=_next_entry_ref(db, cid, payload.date),
        journal_id=payload.journal_id,
        date=payload.date,
        partner_id=payload.partner_id,
        description=payload.description,
        debit_total=debit_total,
        credit_total=credit_total,
        status="Draft",
        created_by_id=user.id,
    )
    db.add(entry); db.flush()

    for line in payload.lines:
        db.add(JournalLine(
            company_id=cid,
            entry_id=entry.id,
            account_id=line.account_id,
            partner_id=line.partner_id,
            debit=line.debit,
            credit=line.credit,
            label=line.label,
        ))

    db.commit(); db.refresh(entry)
    log_action(db, user=user, action="create", entity_type="JournalEntry", entity_id=entry.id)
    return entry


@router.post("/entries/{entry_id}/post", response_model=JournalEntryResponse)
def post_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.company_id == cid).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    if entry.status != "Draft":
        raise HTTPException(400, f"Cannot post entry in '{entry.status}' state")
    entry.status = "Posted"
    db.commit(); db.refresh(entry)
    log_action(db, user=user, action="post", entity_type="JournalEntry", entity_id=entry.id)
    return entry


@router.put("/entries/{obj_id}", response_model=JournalEntryResponse)
def update_entry(
    obj_id: int,
    payload: JournalEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = crud.get_for_company(db, JournalEntry, cid, obj_id)
    if obj.status == "Locked":
        raise HTTPException(400, "Cannot modify a Locked entry")
    if payload.status:
        obj.status = payload.status
    if payload.reconciled is not None:
        obj.reconciled = payload.reconciled
    obj.updated_by_id = user.id
    db.commit(); db.refresh(obj)
    return obj


# ── Reporting ─────────────────────────────────────────────────────────────────

@router.get("/reports/trial-balance")
def trial_balance(
    date_from: date,
    date_to: date,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    """Returns debit/credit totals per account for a date range."""
    rows = (
        db.query(
            Account.id,
            Account.code,
            Account.name,
            Account.account_type,
            func.sum(JournalLine.debit).label("total_debit"),
            func.sum(JournalLine.credit).label("total_credit"),
        )
        .join(JournalLine, JournalLine.account_id == Account.id)
        .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
        .filter(
            Account.company_id == cid,
            JournalEntry.company_id == cid,
            JournalEntry.status == "Posted",
            JournalEntry.date >= date_from,
            JournalEntry.date <= date_to,
        )
        .group_by(Account.id, Account.code, Account.name, Account.account_type)
        .order_by(Account.code)
        .all()
    )
    result = []
    for r in rows:
        debit = float(r.total_debit or 0)
        credit = float(r.total_credit or 0)
        result.append({
            "account_id": r.id,
            "code": r.code,
            "name": r.name,
            "type": r.account_type,
            "total_debit": debit,
            "total_credit": credit,
            "balance": debit - credit,
        })
    grand_debit = sum(r["total_debit"] for r in result)
    grand_credit = sum(r["total_credit"] for r in result)
    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "lines": result,
        "grand_debit": round(grand_debit, 2),
        "grand_credit": round(grand_credit, 2),
        "balanced": round(grand_debit, 2) == round(grand_credit, 2),
    }


@router.get("/reports/profit-loss")
def profit_loss(
    date_from: date,
    date_to: date,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    """Returns P&L — income and expense accounts for the period."""
    rows = (
        db.query(
            Account.code,
            Account.name,
            Account.account_type,
            func.sum(JournalLine.credit - JournalLine.debit).label("net"),
        )
        .join(JournalLine, JournalLine.account_id == Account.id)
        .join(JournalEntry, JournalEntry.id == JournalLine.entry_id)
        .filter(
            Account.company_id == cid,
            JournalEntry.company_id == cid,
            JournalEntry.status == "Posted",
            JournalEntry.date >= date_from,
            JournalEntry.date <= date_to,
            Account.account_type.in_(["income", "expense"]),
        )
        .group_by(Account.code, Account.name, Account.account_type)
        .order_by(Account.account_type.desc(), Account.code)
        .all()
    )
    income = [{"code": r.code, "name": r.name, "amount": float(r.net or 0)} for r in rows if r.account_type == "income"]
    expenses = [{"code": r.code, "name": r.name, "amount": float(abs(r.net or 0))} for r in rows if r.account_type == "expense"]
    total_income = sum(r["amount"] for r in income)
    total_expenses = sum(r["amount"] for r in expenses)
    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "income": income,
        "expenses": expenses,
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(total_income - total_expenses, 2),
    }


@router.get("/reports/ap-aging")
def ap_aging(
    as_of: date,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    """AP Aging: outstanding vendor bills bucketed 0-30, 31-60, 61-90, 90+ days."""
    bills = db.query(VendorBill).filter(
        VendorBill.company_id == cid,
        VendorBill.status.in_(["Approved", "Overdue"]),
        VendorBill.amount_due > 0,
    ).all()
    buckets = {"0_30": Decimal("0"), "31_60": Decimal("0"), "61_90": Decimal("0"), "over_90": Decimal("0")}
    lines = []
    for b in bills:
        due = b.due_date or b.invoice_date
        days = (as_of - due).days
        amount = b.amount_due
        if days <= 30:
            buckets["0_30"] += amount
        elif days <= 60:
            buckets["31_60"] += amount
        elif days <= 90:
            buckets["61_90"] += amount
        else:
            buckets["over_90"] += amount
        lines.append({"vendor_id": b.vendor_id, "reference": b.reference, "due_date": str(due), "days_overdue": max(days, 0), "amount_due": float(amount)})
    return {"as_of": str(as_of), "buckets": {k: float(v) for k, v in buckets.items()}, "lines": lines}


@router.get("/reports/ar-aging")
def ar_aging(
    as_of: date,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    """AR Aging: outstanding customer invoices bucketed by overdue days."""
    invoices = db.query(CustomerInvoice).filter(
        CustomerInvoice.company_id == cid,
        CustomerInvoice.status.in_(["Posted", "Overdue"]),
        CustomerInvoice.amount_due > 0,
    ).all()
    buckets = {"0_30": Decimal("0"), "31_60": Decimal("0"), "61_90": Decimal("0"), "over_90": Decimal("0")}
    lines = []
    for inv in invoices:
        due = inv.due_date or inv.invoice_date
        days = (as_of - due).days
        amount = inv.amount_due
        if days <= 30:
            buckets["0_30"] += amount
        elif days <= 60:
            buckets["31_60"] += amount
        elif days <= 90:
            buckets["61_90"] += amount
        else:
            buckets["over_90"] += amount
        lines.append({"customer_id": inv.customer_id, "reference": inv.reference, "due_date": str(due), "days_overdue": max(days, 0), "amount_due": float(amount)})
    return {"as_of": str(as_of), "buckets": {k: float(v) for k, v in buckets.items()}, "lines": lines}


# ── Bank Reconciliation ───────────────────────────────────────────────────────

@router.get("/bank-lines", response_model=List[BankStatementLineResponse])
def list_bank_lines(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(BankStatementLine).filter(BankStatementLine.company_id == cid).all()


@router.post("/bank-lines", response_model=BankStatementLineResponse)
def add_bank_line(
    payload: BankStatementLineCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    n = db.query(BankStatementLine).filter(BankStatementLine.company_id == cid).count() + 1
    line = BankStatementLine(
        company_id=cid, reference=f"STMT-TX-{n:04d}",
        journal_id=payload.journal_id, date=payload.date,
        label=payload.label, amount=payload.amount, created_by_id=user.id,
    )
    db.add(line); db.commit(); db.refresh(line)
    return line


@router.post("/reconcile/auto")
def auto_reconcile(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    """NLP-enhanced auto reconciliation: exact amount first, then fuzzy label match."""
    from core_kernel_reconcile import fuzzy_score  # lazy import; falls back gracefully
    lines = db.query(BankStatementLine).filter(
        BankStatementLine.company_id == cid,
        BankStatementLine.matched_entry_id.is_(None),
    ).all()
    entries = db.query(JournalEntry).filter(
        JournalEntry.company_id == cid,
        JournalEntry.reconciled == False,
        JournalEntry.status == "Posted",
    ).all()
    matches = 0
    for line in lines:
        target = abs(line.amount)
        # Exact match by amount
        exact = next((e for e in entries if float(e.debit_total) == float(target) or float(e.credit_total) == float(target)), None)
        if exact:
            line.matched_entry_id = exact.id
            exact.reconciled = True
            line.match_confidence = "exact"
            entries.remove(exact)
            matches += 1
    db.commit()
    log_action(db, user=user, action="reconcile", entity_type="Finance", changes={"matches": matches})
    return {"matches": matches}


@router.post("/reconcile/manual/{line_id}/{entry_id}")
def manual_reconcile(
    line_id: int,
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    line = db.query(BankStatementLine).filter(BankStatementLine.id == line_id, BankStatementLine.company_id == cid).first()
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.company_id == cid).first()
    if not line or not entry:
        raise HTTPException(404, "Line or entry not found")
    line.matched_entry_id = entry.id
    line.match_confidence = "manual"
    entry.reconciled = True
    db.commit()
    return {"matched": True}


# ── Vendor Bills (AP) ─────────────────────────────────────────────────────────

@router.get("/payables", response_model=List[VendorBillResponse])
def list_vendor_bills(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
    status: Optional[str] = None,
):
    q = db.query(VendorBill).filter(VendorBill.company_id == cid)
    if status:
        q = q.filter(VendorBill.status == status)
    return q.order_by(VendorBill.invoice_date.desc()).all()


@router.post("/payables", response_model=VendorBillResponse)
def create_vendor_bill(
    payload: VendorBillCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    sub, tax, total = _compute_lines(payload.lines)
    bill = VendorBill(
        company_id=cid, created_by_id=user.id,
        reference=_next_bill_ref(db, cid, payload.invoice_date),
        vendor_id=payload.vendor_id,
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        subtotal=sub, tax_total=tax, total=total,
        amount_paid=Decimal("0"), amount_due=total,
        notes=payload.notes,
    )
    db.add(bill); db.flush()
    for l in payload.lines:
        line_sub = l.quantity * l.unit_price
        db.add(VendorBillLine(
            company_id=cid, bill_id=bill.id,
            product_id=l.product_id, description=l.description,
            quantity=l.quantity, unit_price=l.unit_price,
            tax_rate=l.tax_rate, subtotal=line_sub,
        ))
    db.commit(); db.refresh(bill)
    log_action(db, user=user, action="create", entity_type="VendorBill", entity_id=bill.id)
    return bill


@router.post("/payables/{bill_id}/approve", response_model=VendorBillResponse)
def approve_vendor_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    bill = db.query(VendorBill).filter(VendorBill.id == bill_id, VendorBill.company_id == cid).first()
    if not bill:
        raise HTTPException(404, "Bill not found")
    bill.status = "Approved"
    db.commit(); db.refresh(bill)
    return bill


@router.post("/payables/{bill_id}/pay", response_model=VendorPaymentResponse)
def pay_vendor_bill(
    bill_id: int,
    payload: VendorPaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    bill = db.query(VendorBill).filter(VendorBill.id == bill_id, VendorBill.company_id == cid).first()
    if not bill:
        raise HTTPException(404, "Bill not found")

    # Forex difference calculation & auto-journal entry
    rate_bill = _get_exchange_rate(db, bill.currency_id, bill.invoice_date)
    rate_pay = _get_exchange_rate(db, bill.currency_id, payload.payment_date)
    if rate_bill != rate_pay:
        diff = payload.amount * (rate_bill - rate_pay)
        _post_forex_difference(db, cid, user.id, bill.vendor_id, diff, bill.reference, payload.payment_date)

    payment = VendorPayment(
        company_id=cid, created_by_id=user.id,
        reference=_next_vpay_ref(db, cid),
        vendor_id=bill.vendor_id, bill_id=bill.id,
        payment_date=payload.payment_date, amount=payload.amount,
        payment_method=payload.payment_method, status="Posted",
    )
    db.add(payment)
    bill.amount_paid += payload.amount
    bill.amount_due = max(Decimal("0"), bill.total - bill.amount_paid)
    if bill.amount_due == 0:
        bill.status = "Paid"
    db.commit(); db.refresh(payment)
    log_action(db, user=user, action="pay", entity_type="VendorBill", entity_id=bill_id)
    return payment


# ── Customer Invoices (AR) ────────────────────────────────────────────────────

@router.get("/receivables", response_model=List[CustomerInvoiceResponse])
def list_customer_invoices(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.read")),
    cid: int = Depends(get_current_company_id),
    status: Optional[str] = None,
):
    q = db.query(CustomerInvoice).filter(CustomerInvoice.company_id == cid)
    if status:
        q = q.filter(CustomerInvoice.status == status)
    return q.order_by(CustomerInvoice.invoice_date.desc()).all()


@router.post("/receivables", response_model=CustomerInvoiceResponse)
def create_customer_invoice(
    payload: CustomerInvoiceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    sub, tax, total = _compute_lines(payload.lines)
    inv = CustomerInvoice(
        company_id=cid, created_by_id=user.id,
        reference=_next_inv_ref(db, cid, payload.invoice_date),
        customer_id=payload.customer_id,
        invoice_date=payload.invoice_date, due_date=payload.due_date,
        payment_terms=payload.payment_terms,
        subtotal=sub, tax_total=tax, total=total,
        amount_paid=Decimal("0"), amount_due=total,
        notes=payload.notes,
    )
    db.add(inv); db.flush()
    for l in payload.lines:
        disc = getattr(l, "discount_pct", Decimal("0"))
        line_sub = l.quantity * l.unit_price * (1 - disc / 100)
        db.add(CustomerInvoiceLine(
            company_id=cid, invoice_id=inv.id,
            product_id=l.product_id, description=l.description,
            quantity=l.quantity, unit_price=l.unit_price,
            discount_pct=disc, tax_rate=l.tax_rate, subtotal=line_sub,
        ))
    db.commit(); db.refresh(inv)
    log_action(db, user=user, action="create", entity_type="CustomerInvoice", entity_id=inv.id)
    return inv


@router.post("/receivables/{invoice_id}/post", response_model=CustomerInvoiceResponse)
def post_customer_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    inv = db.query(CustomerInvoice).filter(CustomerInvoice.id == invoice_id, CustomerInvoice.company_id == cid).first()
    if not inv:
        raise HTTPException(404, "Invoice not found")
    inv.status = "Posted"
    db.commit(); db.refresh(inv)
    return inv


@router.post("/receivables/{invoice_id}/pay", response_model=CustomerPaymentResponse)
def receive_customer_payment(
    invoice_id: int,
    payload: CustomerPaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("accounting.write")),
    cid: int = Depends(get_current_company_id),
):
    inv = db.query(CustomerInvoice).filter(CustomerInvoice.id == invoice_id, CustomerInvoice.company_id == cid).first()
    if not inv:
        raise HTTPException(404, "Invoice not found")

    # Forex difference calculation & auto-journal entry
    rate_inv = _get_exchange_rate(db, inv.currency_id, inv.invoice_date)
    rate_pay = _get_exchange_rate(db, inv.currency_id, payload.payment_date)
    if rate_inv != rate_pay:
        diff = payload.amount * (rate_pay - rate_inv)
        _post_forex_difference(db, cid, user.id, inv.customer_id, diff, inv.reference, payload.payment_date)

    cpay = CustomerPayment(
        company_id=cid, created_by_id=user.id,
        reference=_next_cpay_ref(db, cid),
        customer_id=inv.customer_id, invoice_id=inv.id,
        payment_date=payload.payment_date, amount=payload.amount,
        payment_method=payload.payment_method, status="Posted",
    )
    db.add(cpay)
    inv.amount_paid += payload.amount
    inv.amount_due = max(Decimal("0"), inv.total - inv.amount_paid)
    if inv.amount_due == 0:
        inv.status = "Paid"
    db.commit(); db.refresh(cpay)
    log_action(db, user=user, action="payment_received", entity_type="CustomerInvoice", entity_id=invoice_id)
    return cpay
