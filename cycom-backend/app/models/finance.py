from sqlalchemy import Column, String, ForeignKey, Integer, Numeric, Date, Boolean, Text
from sqlalchemy.sql import func

from app.db.base import BaseEntity


class Currency(BaseEntity):
    __tablename__ = "fin_currencies"
    name = Column(String, nullable=False)           # USD, EUR, GBP...
    symbol = Column(String, nullable=False)         # $, €, £
    rate_to_jod = Column(Numeric(14, 6), default=1, nullable=False)
    is_active = Column(Boolean, default=True)


class ExchangeRate(BaseEntity):
    __tablename__ = "fin_exchange_rates"
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    rate = Column(Numeric(14, 6), nullable=False)


class FiscalPeriod(BaseEntity):
    __tablename__ = "fin_fiscal_periods"
    name = Column(String, nullable=False)           # "January 2026"
    date_start = Column(Date, nullable=False)
    date_end = Column(Date, nullable=False)
    state = Column(String, default="open", nullable=False)  # open|closed|locked


class Account(BaseEntity):
    __tablename__ = "fin_accounts"
    code = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)  # asset|liability|equity|income|expense
    parent_id = Column(Integer, ForeignKey("fin_accounts.id"), nullable=True)
    is_reconcilable = Column(Boolean, default=False)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)


class Journal(BaseEntity):
    __tablename__ = "fin_journals"
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    journal_type = Column(String, nullable=False)  # bank|cash|sale|purchase|general
    default_account_id = Column(Integer, ForeignKey("fin_accounts.id"), nullable=True)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)


class JournalEntry(BaseEntity):
    __tablename__ = "fin_journal_entries"
    reference = Column(String, unique=True, index=True, nullable=False)
    journal_id = Column(Integer, ForeignKey("fin_journals.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Posted|Locked
    reconciled = Column(Boolean, default=False, nullable=False)
    debit_total = Column(Numeric(14, 2), default=0, nullable=False)
    credit_total = Column(Numeric(14, 2), default=0, nullable=False)
    fiscal_period_id = Column(Integer, ForeignKey("fin_fiscal_periods.id"), nullable=True)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)
    amount_currency = Column(Numeric(14, 2), nullable=True)


class JournalLine(BaseEntity):
    __tablename__ = "fin_journal_lines"
    entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("fin_accounts.id"), nullable=False)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True)
    debit = Column(Numeric(14, 2), default=0, nullable=False)
    credit = Column(Numeric(14, 2), default=0, nullable=False)
    label = Column(String, nullable=True)
    reconciled = Column(Boolean, default=False)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)
    amount_currency = Column(Numeric(14, 2), nullable=True)


class BankStatementLine(BaseEntity):
    __tablename__ = "fin_bank_statement_lines"
    reference = Column(String, unique=True, index=True, nullable=False)
    journal_id = Column(Integer, ForeignKey("fin_journals.id"), nullable=False)
    date = Column(Date, nullable=False)
    label = Column(String, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    matched_entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=True)
    match_confidence = Column(String, nullable=True)  # exact|fuzzy|manual


# ─── Accounts Payable ────────────────────────────────────────────────────────

class VendorBill(BaseEntity):
    __tablename__ = "fin_vendor_bills"
    reference = Column(String, unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    purchase_order_id = Column(Integer, nullable=True)  # soft link to purchase_orders
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Approved|Paid|Overdue|Cancelled
    subtotal = Column(Numeric(14, 2), default=0, nullable=False)
    tax_total = Column(Numeric(14, 2), default=0, nullable=False)
    total = Column(Numeric(14, 2), default=0, nullable=False)
    amount_paid = Column(Numeric(14, 2), default=0, nullable=False)
    amount_due = Column(Numeric(14, 2), default=0, nullable=False)
    journal_entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=True)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)
    notes = Column(Text, nullable=True)


class VendorBillLine(BaseEntity):
    __tablename__ = "fin_vendor_bill_lines"
    bill_id = Column(Integer, ForeignKey("fin_vendor_bills.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    description = Column(String, nullable=False)
    quantity = Column(Numeric(14, 3), nullable=False)
    unit_price = Column(Numeric(14, 2), nullable=False)
    tax_rate = Column(Numeric(5, 4), default=0, nullable=False)
    account_id = Column(Integer, ForeignKey("fin_accounts.id"), nullable=True)
    subtotal = Column(Numeric(14, 2), default=0, nullable=False)


class VendorPayment(BaseEntity):
    __tablename__ = "fin_vendor_payments"
    reference = Column(String, unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    bill_id = Column(Integer, ForeignKey("fin_vendor_bills.id"), nullable=True)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    payment_method = Column(String, default="bank_transfer", nullable=False)
    journal_id = Column(Integer, ForeignKey("fin_journals.id"), nullable=True)
    journal_entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Posted


# ─── Accounts Receivable ─────────────────────────────────────────────────────

class CustomerInvoice(BaseEntity):
    __tablename__ = "fin_customer_invoices"
    reference = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("partners.id"), nullable=False, index=True)
    sales_order_id = Column(Integer, nullable=True)  # soft link
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Posted|Paid|Overdue|Cancelled
    subtotal = Column(Numeric(14, 2), default=0, nullable=False)
    tax_total = Column(Numeric(14, 2), default=0, nullable=False)
    total = Column(Numeric(14, 2), default=0, nullable=False)
    amount_paid = Column(Numeric(14, 2), default=0, nullable=False)
    amount_due = Column(Numeric(14, 2), default=0, nullable=False)
    journal_entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=True)
    currency_id = Column(Integer, ForeignKey("fin_currencies.id"), nullable=True)
    payment_terms = Column(String, nullable=True)  # Net30|Net60|Immediate
    jofotara_uuid = Column(String, nullable=True)
    notes = Column(Text, nullable=True)


class CustomerInvoiceLine(BaseEntity):
    __tablename__ = "fin_customer_invoice_lines"
    invoice_id = Column(Integer, ForeignKey("fin_customer_invoices.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    description = Column(String, nullable=False)
    quantity = Column(Numeric(14, 3), nullable=False)
    unit_price = Column(Numeric(14, 2), nullable=False)
    discount_pct = Column(Numeric(5, 2), default=0, nullable=False)
    tax_rate = Column(Numeric(5, 4), default=0, nullable=False)
    account_id = Column(Integer, ForeignKey("fin_accounts.id"), nullable=True)
    subtotal = Column(Numeric(14, 2), default=0, nullable=False)


class CustomerPayment(BaseEntity):
    __tablename__ = "fin_customer_payments"
    reference = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("fin_customer_invoices.id"), nullable=True)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    payment_method = Column(String, default="bank_transfer", nullable=False)
    journal_id = Column(Integer, ForeignKey("fin_journals.id"), nullable=True)
    journal_entry_id = Column(Integer, ForeignKey("fin_journal_entries.id"), nullable=True)
    status = Column(String, default="Draft", nullable=False)
