from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class _M(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Work Center ──────────────────────────────────────────────────────────────

class WorkCenterCreate(BaseModel):
    code: str
    name: str
    capacity_hours: Decimal = Decimal("8.0")
    efficiency_pct: Decimal = Decimal("100.0")
    cost_per_hour: Decimal = Decimal("0.0")


class WorkCenterResponse(_M):
    id: int
    code: str
    name: str
    capacity_hours: Decimal
    efficiency_pct: Decimal
    cost_per_hour: Decimal


# ─── Routing ──────────────────────────────────────────────────────────────────

class RoutingCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class RoutingResponse(_M):
    id: int
    code: str
    name: str
    description: Optional[str] = None


class RoutingOperationCreate(BaseModel):
    routing_id: int
    sequence: int = 10
    name: str
    work_center_id: int
    duration_mins: Decimal = Decimal("60.0")


class RoutingOperationResponse(_M):
    id: int
    routing_id: int
    sequence: int
    name: str
    work_center_id: int
    duration_mins: Decimal


# ─── Bill of Materials ────────────────────────────────────────────────────────

class BillOfMaterialsLineCreate(BaseModel):
    product_id: int
    quantity: Decimal
    scrap_pct: Decimal = Decimal("0.0")


class BillOfMaterialsLineResponse(_M):
    id: int
    bom_id: int
    product_id: int
    quantity: Decimal
    scrap_pct: Decimal


class BillOfMaterialsCreate(BaseModel):
    product_id: int
    code: Optional[str] = None
    version: str = "1.0"
    routing_id: Optional[int] = None
    lines: List[BillOfMaterialsLineCreate]


class BillOfMaterialsResponse(_M):
    id: int
    product_id: int
    code: Optional[str] = None
    version: str
    routing_id: Optional[int] = None
    is_active: bool
    total_cost: Decimal


# ─── Manufacturing Order ──────────────────────────────────────────────────────

class ManufacturingOrderCreate(BaseModel):
    product_id: int
    bom_id: int
    quantity: Decimal
    date_planned: date
    notes: Optional[str] = None


class ManufacturingOrderResponse(_M):
    id: int
    reference: str
    product_id: int
    bom_id: int
    quantity: Decimal
    date_planned: date
    date_start: Optional[date] = None
    date_finished: Optional[date] = None
    status: str
    notes: Optional[str] = None


# ─── Work Order ───────────────────────────────────────────────────────────────

class WorkOrderResponse(_M):
    id: int
    production_id: int
    operation_name: str
    work_center_id: int
    sequence: int
    duration_planned: Decimal
    duration_actual: Decimal
    status: str


# ─── ECO ──────────────────────────────────────────────────────────────────────

class ECOCreate(BaseModel):
    name: str
    bom_id: int
    change_type: str
    description: Optional[str] = None
    effectivity_date: Optional[date] = None


class ECOResponse(_M):
    id: int
    reference: str
    name: str
    bom_id: int
    change_type: str
    description: Optional[str] = None
    status: str
    approved_by_id: Optional[int] = None
    effectivity_date: Optional[date] = None


# ─── Quality ──────────────────────────────────────────────────────────────────

class QualityInspectionResponse(_M):
    id: int
    reference: str
    production_id: int
    work_order_id: Optional[int] = None
    inspector_id: Optional[int] = None
    result: str
    notes: Optional[str] = None
