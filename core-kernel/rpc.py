# -*- coding: utf-8 -*-
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Security
from sqlalchemy.orm import Session
from decimal import Decimal

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps")))

from db import get_tenant_session
from auth import get_current_user

# Import all models from hot-plug apps
from apps.finance.models import Account, JournalEntry, JournalLine, Invoice, InvoiceLine, Payment, BankStatement, BankStatementLine
from apps.hr.models import Employee, Department, Position, Contract, Leave, Attendance, Payslip
from apps.crm.models import Lead, Opportunity, Activity, Partner, SaleOrder, SaleOrderLine
from apps.inventory.models import Product, Warehouse, StockLocation, StockQuant, StockMove, PurchaseOrder, PurchaseOrderLine
from apps.mrp.models import WorkCenter, BillOfMaterials, BillOfMaterialsLine, WorkOrder, ManufacturingOrder, Routing, RoutingStep
from apps.projects.models import Project, Task, Timesheet, Milestone, Budget

logger = logging.getLogger("cycom-rpc")
router = APIRouter(prefix="/api/rpc", tags=["RPC Layer"])

# Mapping frontend model names to SQLAlchemy model classes
MODEL_MAP = {
    "hr.employee": Employee,
    "hr.department": Department,
    "hr.position": Position,
    "hr.contract": Contract,
    "hr.leave": Leave,
    "hr.attendance": Attendance,
    "hr.payslip": Payslip,
    
    "finance.account": Account,
    "finance.journal_entry": JournalEntry,
    "finance.journal_line": JournalLine,
    "finance.invoice": Invoice,
    "finance.invoice_line": InvoiceLine,
    "finance.payment": Payment,
    "finance.bank_statement": BankStatement,
    "finance.bank_statement_line": BankStatementLine,
    
    "crm.lead": Lead,
    "crm.opportunity": Opportunity,
    "crm.activity": Activity,
    "crm.partner": Partner,
    "crm.sale_order": SaleOrder,
    "crm.sale_order_line": SaleOrderLine,
    
    "inventory.warehouse": Warehouse,
    "inventory.location": StockLocation,
    "inventory.product": Product,
    "inventory.quant": StockQuant,
    "inventory.stock_move": StockMove,
    "inventory.purchase_order": PurchaseOrder,
    "inventory.purchase_order_line": PurchaseOrderLine,
    
    "mrp.work_center": WorkCenter,
    "mrp.bom": BillOfMaterials,
    "mrp.bom_line": BillOfMaterialsLine,
    "mrp.work_order": WorkOrder,
    "mrp.manufacturing_order": ManufacturingOrder,
    
    "project.project": Project,
    "project.task": Task,
    "project.timesheet": Timesheet,
    "project.milestone": Milestone,
    "project.budget": Budget,
}


def serialize_generic(obj, db: Session) -> dict:
    """Fallback generic serializer converting SQLAlchemy objects to JSON dicts."""
    res = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if isinstance(val, Decimal):
            res[col.name] = float(val)
        elif hasattr(val, "isoformat"):
            res[col.name] = val.isoformat()
        else:
            res[col.name] = val
    # Add name computed field for list widgets
    if "name" not in res:
        res["name"] = getattr(obj, "title", getattr(obj, "number", getattr(obj, "code", f"Record #{obj.id}")))
    return res


def serialize_employee(emp: Employee, db: Session) -> dict:
    dept_name = ""
    if emp.department_id:
        dept = db.query(Department).filter(Department.id == emp.department_id).first()
        dept_name = dept.name if dept else ""

    job_title = "Unassigned"
    if emp.position_id:
        pos = db.query(Position).filter(Position.id == emp.position_id).first()
        job_title = pos.title if pos else "Unassigned"

    return {
        "id": emp.id,
        "name": f"{emp.first_name} {emp.last_name}".strip() if (emp.first_name or emp.last_name) else "Unnamed",
        "work_email": emp.email or "",
        "work_phone": emp.phone or "",
        "work_location_id": [1, emp.location] if emp.location else False,
        "department_id": [emp.department_id, dept_name] if emp.department_id else False,
        "job_title": job_title,
        "joined": emp.joined_date.isoformat() if emp.joined_date else None,
        "bank": emp.bank or "N/A",
        "iban": emp.iban or "N/A",
        "status": emp.status or "active",
    }


def serialize_task(t: Task, db: Session) -> dict:
    proj_name = "General"
    if t.project_id:
        proj = db.query(Project).filter(Project.id == t.project_id).first()
        proj_name = proj.name if proj else "General"

    return {
        "id": t.id,
        "name": t.title,
        "description": t.description or "",
        "project_id": [t.project_id, proj_name],
        "stage": t.stage,
        "priority": t.priority,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "estimated_hours": float(t.estimated_hours),
    }


@router.post("")
@router.post("/")
def rpc_call(request: Request, payload: Dict[str, Any], user: dict = Security(get_current_user)):
    """Dynamic RPC query and mutation dispatcher."""
    # Resolve the tenant ID for dynamic sharding
    tenant_id_str = request.headers.get("X-Tenant-ID", "1")
    try:
        tenant_id = int(tenant_id_str)
    except ValueError:
        tenant_id = 1

    db = get_tenant_session(tenant_id)
    try:
        model = payload.get("model")
        method = payload.get("method")
        args = payload.get("args", [])
        kwargs = payload.get("kwargs", {})

        logger.info(f"RPC dispatch: model={model}, method={method}, tenant={tenant_id}")

        if model not in MODEL_MAP:
            raise HTTPException(status_code=400, detail=f"Model '{model}' is not registered.")

        model_class = MODEL_MAP[model]

        if method == "search_read":
            domain = args[0] if len(args) > 0 else []
            limit = kwargs.get("limit", 200)
            offset = kwargs.get("offset", 0)

            query = db.query(model_class)
            if hasattr(model_class, "tenant_id"):
                query = query.filter(model_class.tenant_id == tenant_id)

            # Apply basic filters
            for term in domain:
                if isinstance(term, list) and len(term) == 3:
                    field, op, val = term
                    if hasattr(model_class, field):
                        col = getattr(model_class, field)
                        if op == "=":
                            query = query.filter(col == val)
                        elif op == "in":
                            query = query.filter(col.in_(val))

            records = query.offset(offset).limit(limit).all()

            serialized = []
            for r in records:
                if model == "hr.employee":
                    serialized.append(serialize_employee(r, db))
                elif model == "project.task":
                    serialized.append(serialize_task(r, db))
                else:
                    serialized.append(serialize_generic(r, db))
            return serialized

        elif method == "create":
            if len(args) < 1:
                raise HTTPException(status_code=400, detail="Missing values dictionary.")
            vals = args[0]
            
            # Map frontend names to core models
            mapped_vals = {}
            for k, v in vals.items():
                if model == "hr.employee" and k == "name":
                    parts = v.strip().split(" ", 1)
                    mapped_vals["first_name"] = parts[0]
                    mapped_vals["last_name"] = parts[1] if len(parts) > 1 else ""
                elif model == "project.task" and k == "name":
                    mapped_vals["title"] = v
                else:
                    mapped_vals[k] = v

            if hasattr(model_class, "tenant_id"):
                mapped_vals["tenant_id"] = tenant_id
            if hasattr(model_class, "company_id") and "company_id" not in mapped_vals:
                mapped_vals["company_id"] = 1

            new_obj = model_class(**mapped_vals)
            db.add(new_obj)
            db.commit()
            db.refresh(new_obj)
            return new_obj.id

        elif method == "write":
            if len(args) < 2:
                raise HTTPException(status_code=400, detail="Missing id or write values.")
            obj_id, vals = args[0], args[1]
            obj_ids = obj_id if isinstance(obj_id, list) else [obj_id]

            records = db.query(model_class).filter(model_class.id.in_(obj_ids), model_class.tenant_id == tenant_id).all()
            for r in records:
                for k, v in vals.items():
                    if hasattr(r, k):
                        setattr(r, k, v)
            db.commit()
            return True

        elif method == "unlink":
            obj_ids = args[0] if isinstance(args[0], list) else [args[0]]
            db.query(model_class).filter(model_class.id.in_(obj_ids), model_class.tenant_id == tenant_id).delete(synchronize_session=False)
            db.commit()
            return True

        else:
            raise HTTPException(status_code=400, detail=f"RPC method '{method}' not implemented.")

    except Exception as e:
        db.rollback()
        logger.error(f"RPC Execution Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
