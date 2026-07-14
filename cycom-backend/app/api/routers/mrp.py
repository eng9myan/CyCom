"""
Manufacturing & PLM API Router.
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core import crud
from app.core.audit import log_action
from app.core.dependencies import get_current_company_id, require_permission
from app.db.session import get_db
from app.models.mrp import (
    WorkCenter, Routing, RoutingOperation, BillOfMaterials, BillOfMaterialsLine,
    ManufacturingOrder, WorkOrder, EngineeringChangeOrder, QualityInspection
)
from app.models.product import Product
from app.models.user import User
from app.schemas.mrp import (
    WorkCenterCreate, WorkCenterResponse,
    RoutingCreate, RoutingResponse,
    RoutingOperationCreate, RoutingOperationResponse,
    BillOfMaterialsCreate, BillOfMaterialsResponse,
    BillOfMaterialsLineResponse,
    ManufacturingOrderCreate, ManufacturingOrderResponse,
    WorkOrderResponse,
    ECOCreate, ECOResponse,
    QualityInspectionResponse
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _seq(db: Session, model, cid: int) -> int:
    return db.query(model).filter(model.company_id == cid).count() + 1


def _next_mo_ref(db, cid, dt: date) -> str:
    n = _seq(db, ManufacturingOrder, cid)
    return f"MO/{dt.year}/{dt.month:02d}/{n:04d}"


def _next_eco_ref(db, cid) -> str:
    return f"ECO-{_seq(db, EngineeringChangeOrder, cid):03d}"


# ── Work Centers ─────────────────────────────────────────────────────────────

@router.get("/work-centers", response_model=List[WorkCenterResponse])
def list_work_centers(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(WorkCenter).filter(WorkCenter.company_id == cid).all()


@router.post("/work-centers", response_model=WorkCenterResponse)
def create_work_center(
    payload: WorkCenterCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = WorkCenter(company_id=cid, created_by_id=user.id, **payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


# ── Routings ──────────────────────────────────────────────────────────────────

@router.get("/routings", response_model=List[RoutingResponse])
def list_routings(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(Routing).filter(Routing.company_id == cid).all()


@router.post("/routings", response_model=RoutingResponse)
def create_routing(
    payload: RoutingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = Routing(company_id=cid, created_by_id=user.id, **payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


# ── Bill of Materials (BOM) ───────────────────────────────────────────────────

@router.get("/boms", response_model=List[BillOfMaterialsResponse])
def list_boms(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(BillOfMaterials).filter(BillOfMaterials.company_id == cid).all()


@router.post("/boms", response_model=BillOfMaterialsResponse)
def create_bom(
    payload: BillOfMaterialsCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    # Calculate BOM cost rollup
    total_cost = Decimal("0.0")
    for l in payload.lines:
        prod = db.query(Product).filter(Product.id == l.product_id).first()
        if prod:
            total_cost += l.quantity * prod.cost_price * (1 + l.scrap_pct / 100)

    bom = BillOfMaterials(
        company_id=cid, created_by_id=user.id,
        product_id=payload.product_id, code=payload.code,
        version=payload.version, routing_id=payload.routing_id,
        is_active=True, total_cost=total_cost
    )
    db.add(bom); db.flush()

    for l in payload.lines:
        db.add(BillOfMaterialsLine(
            company_id=cid, bom_id=bom.id,
            product_id=l.product_id, quantity=l.quantity,
            scrap_pct=l.scrap_pct
        ))

    db.commit(); db.refresh(bom)
    log_action(db, user=user, action="create", entity_type="BOM", entity_id=bom.id)
    return bom


@router.post("/boms/{bom_id}/rollup", response_model=BillOfMaterialsResponse)
def rollup_bom_costs(
    bom_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    """BOM cost rollup: recalculates totals based on active raw material costs."""
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == bom_id, BillOfMaterials.company_id == cid).first()
    if not bom:
        raise HTTPException(404, "BOM not found")

    lines = db.query(BillOfMaterialsLine).filter(BillOfMaterialsLine.bom_id == bom_id).all()
    total_cost = Decimal("0.0")
    for l in lines:
        prod = db.query(Product).filter(Product.id == l.product_id).first()
        if prod:
            total_cost += l.quantity * prod.cost_price * (1 + l.scrap_pct / 100)

    bom.total_cost = total_cost
    db.commit(); db.refresh(bom)
    return bom


@router.get("/boms/{bom_id}/tree")
def get_bom_tree(
    bom_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    """Return recursively expanded tree view of BOM components."""
    def expand(target_bom_id):
        b = db.query(BillOfMaterials).filter(BillOfMaterials.id == target_bom_id).first()
        if not b:
            return None
        lines = db.query(BillOfMaterialsLine).filter(BillOfMaterialsLine.bom_id == target_bom_id).all()
        components = []
        for l in lines:
            prod = db.query(Product).filter(Product.id == l.product_id).first()
            # check if component itself has a BOM (recursive sub-assembly)
            sub_bom = db.query(BillOfMaterials).filter(BillOfMaterials.product_id == l.product_id, BillOfMaterials.is_active == True).first()
            components.append({
                "product_id": l.product_id,
                "name": prod.name if prod else "Unknown",
                "sku": prod.sku if prod else "",
                "quantity": float(l.quantity),
                "scrap_pct": float(l.scrap_pct),
                "cost_price": float(prod.cost_price) if prod else 0.0,
                "sub_tree": expand(sub_bom.id) if sub_bom else None
            })
        return {
            "bom_id": b.id,
            "version": b.version,
            "total_cost": float(b.total_cost),
            "components": components
        }

    return expand(bom_id)


# ── Manufacturing Orders (MO) ─────────────────────────────────────────────────

@router.get("/production", response_model=List[ManufacturingOrderResponse])
def list_production_orders(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(ManufacturingOrder).filter(ManufacturingOrder.company_id == cid).all()


@router.post("/production", response_model=ManufacturingOrderResponse)
def create_production_order(
    payload: ManufacturingOrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    mo = ManufacturingOrder(
        company_id=cid, created_by_id=user.id,
        reference=_next_mo_ref(db, cid, payload.date_planned),
        product_id=payload.product_id, bom_id=payload.bom_id,
        quantity=payload.quantity, date_planned=payload.date_planned,
        status="Draft", notes=payload.notes
    )
    db.add(mo); db.commit(); db.refresh(mo)
    log_action(db, user=user, action="create", entity_type="ManufacturingOrder", entity_id=mo.id)
    return mo


@router.post("/production/{mo_id}/confirm", response_model=ManufacturingOrderResponse)
def confirm_production_order(
    mo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    mo = db.query(ManufacturingOrder).filter(ManufacturingOrder.id == mo_id, ManufacturingOrder.company_id == cid).first()
    if not mo:
        raise HTTPException(404, "MO not found")
    if mo.status != "Draft":
        raise HTTPException(400, "Only Draft MOs can be confirmed")

    # Generate work orders based on routing if BOM has routing
    bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == mo.bom_id).first()
    if bom and bom.routing_id:
        ops = db.query(RoutingOperation).filter(RoutingOperation.routing_id == bom.routing_id).order_by(RoutingOperation.sequence).all()
        for op in ops:
            db.add(WorkOrder(
                company_id=cid, production_id=mo.id,
                operation_name=op.name, work_center_id=op.work_center_id,
                sequence=op.sequence,
                duration_planned=op.duration_mins * mo.quantity,
                duration_actual=Decimal("0"), status="Ready"
            ))

    mo.status = "Confirmed"
    mo.date_start = date.today()
    db.commit(); db.refresh(mo)
    return mo


@router.post("/production/{mo_id}/finish", response_model=ManufacturingOrderResponse)
def finish_production_order(
    mo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    mo = db.query(ManufacturingOrder).filter(ManufacturingOrder.id == mo_id, ManufacturingOrder.company_id == cid).first()
    if not mo:
        raise HTTPException(404, "MO not found")
    mo.status = "Done"
    mo.date_finished = date.today()
    db.commit(); db.refresh(mo)
    return mo


# ── Engineering Change Orders (ECO) ───────────────────────────────────────────

@router.get("/eco", response_model=List[ECOResponse])
def list_ecos(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(EngineeringChangeOrder).filter(EngineeringChangeOrder.company_id == cid).all()


@router.post("/eco", response_model=ECOResponse)
def create_eco(
    payload: ECOCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    obj = EngineeringChangeOrder(
        company_id=cid, created_by_id=user.id,
        reference=_next_eco_ref(db, cid),
        status="Draft", **payload.model_dump()
    )
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


@router.post("/eco/{eco_id}/approve", response_model=ECOResponse)
def approve_eco(
    eco_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.write")),
    cid: int = Depends(get_current_company_id),
):
    eco = db.query(EngineeringChangeOrder).filter(EngineeringChangeOrder.id == eco_id, EngineeringChangeOrder.company_id == cid).first()
    if not eco:
        raise HTTPException(404, "ECO not found")
    eco.status = "Approved"
    eco.approved_by_id = user.id
    db.commit(); db.refresh(eco)
    return eco


# ── Quality Inspections ───────────────────────────────────────────────────────

@router.get("/quality", response_model=List[QualityInspectionResponse])
def list_quality_inspections(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("mrp.read")),
    cid: int = Depends(get_current_company_id),
):
    return db.query(QualityInspection).filter(QualityInspection.company_id == cid).all()
