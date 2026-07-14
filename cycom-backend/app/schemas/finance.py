from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class _M(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Currency ────────────────────────────────────────────────────────────────

class CurrencyCreate(BaseModel):
    name: str
    symbol: str
    rate_to_jod: Decimal = Decimal("1")
    is_active: bool = True


class CurrencyResponse(_M):
    id: int
    name: str
    symbol: str
    rate_to_jod: Decimal
    is_active: bool


# ─── Exchange Rate ───────────────────────────────────────────────────────────

class ExchangeRateCreate(BaseModel):
    currency_id: int
    date: date
    rate: Decimal


class ExchangeRateResponse(_M):
    id: int
    currency_id: int
    date: date
    rate: Decimal


# ─── Fiscal Period ────────────────────────────────────────────────────────────

class FiscalPeriodCreate(BaseModel):
    name: str
    date_start: date
    date_end: date
    state: str = "open"


class FiscalPeriodResponse(_M):
    id: int
    name: str
    date_start: date
    date_end: date
    state: str


# ─── Account ─────────────────────────────────────────────────────────────────

class AccountBase(BaseModel):
    code: str
    name: str
    account_type: str
    parent_id: Optional[int] = None
    is_reconcilable: bool = False


class AccountCreate(AccountBase):
    pass


class AccountResponse(_M, AccountBase):
    id: int
    company_id: int


# ─── Journal ─────────────────────────────────────────────────────────────────

class JournalBase(BaseModel):
    name: str
    code: str
    journal_type: str


class JournalCreate(JournalBase):
    pass


class JournalResponse(_M, JournalBase):
    id: int
    company_id: int


# ─── Journal Entry / Lines ────────────────────────────────────────────────────

class JournalLineCreate(BaseModel):
    account_id: int
    debit: Decimal = Decimal("0")
    credit: Decimal = Decimal("0")
    label: Optional[str] = None
    partner_id: Optional[int] = None


class JournalLineResponse(_M):
    id: int
    account_id: int
    debit: Decimal
    credit: Decimal
    label: Optional[str] = None
    reconciled: bool = False


class JournalEntryCreate(BaseModel):
    journal_id: int
    date: date
    partner_id: Optional[int] = None
    description: Optional[str] = None
    lines: List[JournalLineCreate]


class JournalEntryUpdate(BaseModel):
    status: Optional[str] = None
    reconciled: Optional[bool] = None


class JournalEntryResponse(_M):
    id: int
    reference: str
    company_id: int
    journal_id: int
    date: date
    partner_id: Optional[int] = None
    description: Optional[str] = None
    status: str
    reconciled: bool
    debit_total: Decimal
    credit_total: Decimal


# ─── Bank Statement ───────────────────────────────────────────────────────────

class BankStatementLineCreate(BaseModel):
    journal_id: int
    date: date
    label: str
    amount: Decimal


class BankStatementLineResponse(_M):
    id: int
    reference: str
    company_id: int
    journal_id: int
    date: date
    label: str
    amount: Decimal
    matched_entry_id: Optional[int] = None
    match_confidence: Optional[str] = None


# ─── Vendor Bill (AP) ─────────────────────────────────────────────────────────

class VendorBillLineCreate(BaseModel):
    product_id: Optional[int] = None
    description: str
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal = Decimal("0")
    account_id: Optional[int] = None


class VendorBillLineResponse(_M):
    id: int
    description: str
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    subtotal: Decimal


class VendorBillCreate(BaseModel):
    vendor_id: int
    invoice_date: date
    due_date: Optional[date] = None
    lines: List[VendorBillLineCreate]
    notes: Optional[str] = None


class VendorBillResponse(_M):
    id: int
    reference: str
    vendor_id: int
    invoice_date: date
    due_date: Optional[date] = None
    status: str
    subtotal: Decimal
    tax_total: Decimal
    total: Decimal
    amount_paid: Decimal
    amount_due: Decimal
    notes: Optional[str] = None


class VendorPaymentCreate(BaseModel):
    vendor_id: int
    bill_id: Optional[int] = None
    payment_date: date
    amount: Decimal
    payment_method: str = "bank_transfer"
    journal_id: Optional[int] = None


class VendorPaymentResponse(_M):
    id: int
    reference: str
    vendor_id: int
    bill_id: Optional[int] = None
    payment_date: date
    amount: Decimal
    payment_method: str
    status: str


# ─── Customer Invoice (AR) ────────────────────────────────────────────────────

class CustomerInvoiceLineCreate(BaseModel):
    product_id: Optional[int] = None
    description: str
    quantity: Decimal
    unit_price: Decimal
    discount_pct: Decimal = Decimal("0")
    tax_rate: Decimal = Decimal("0")
    account_id: Optional[int] = None


class CustomerInvoiceLineResponse(_M):
    id: int
    description: str
    quantity: Decimal
    unit_price: Decimal
    discount_pct: Decimal
    tax_rate: Decimal
    subtotal: Decimal


class CustomerInvoiceCreate(BaseModel):
    customer_id: int
    invoice_date: date
    due_date: Optional[date] = None
    payment_terms: Optional[str] = "Net30"
    lines: List[CustomerInvoiceLineCreate]
    notes: Optional[str] = None


class CustomerInvoiceResponse(_M):
    id: int
    reference: str
    customer_id: int
    invoice_date: date
    due_date: Optional[date] = None
    status: str
    subtotal: Decimal
    tax_total: Decimal
    total: Decimal
    amount_paid: Decimal
    amount_due: Decimal
    payment_terms: Optional[str] = None
    jofotara_uuid: Optional[str] = None
    notes: Optional[str] = None


class CustomerPaymentCreate(BaseModel):
    customer_id: int
    invoice_id: Optional[int] = None
    payment_date: date
    amount: Decimal
    payment_method: str = "bank_transfer"
    journal_id: Optional[int] = None


class CustomerPaymentResponse(_M):
    id: int
    reference: str
    customer_id: int
    invoice_id: Optional[int] = None
    payment_date: date
    amount: Decimal
    payment_method: str
    status: str
