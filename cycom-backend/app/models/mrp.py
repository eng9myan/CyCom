from sqlalchemy import Column, String, ForeignKey, Integer, Numeric, Date, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import BaseEntity


class WorkCenter(BaseEntity):
    __tablename__ = "mrp_work_centers"
    code = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    capacity_hours = Column(Numeric(6, 2), default=8.0, nullable=False)
    efficiency_pct = Column(Numeric(5, 2), default=100.0, nullable=False)
    cost_per_hour = Column(Numeric(12, 2), default=0.0, nullable=False)


class Routing(BaseEntity):
    __tablename__ = "mrp_routings"
    code = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)


class RoutingOperation(BaseEntity):
    __tablename__ = "mrp_routing_operations"
    routing_id = Column(Integer, ForeignKey("mrp_routings.id"), nullable=False, index=True)
    sequence = Column(Integer, default=10, nullable=False)
    name = Column(String, nullable=False)
    work_center_id = Column(Integer, ForeignKey("mrp_work_centers.id"), nullable=False)
    duration_mins = Column(Numeric(8, 2), default=60.0, nullable=False)


class BillOfMaterials(BaseEntity):
    __tablename__ = "mrp_boms"
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    code = Column(String, nullable=True)
    version = Column(String, default="1.0", nullable=False)
    routing_id = Column(Integer, ForeignKey("mrp_routings.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    total_cost = Column(Numeric(12, 2), default=0.0, nullable=False)


class BillOfMaterialsLine(BaseEntity):
    __tablename__ = "mrp_bom_lines"
    bom_id = Column(Integer, ForeignKey("mrp_boms.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Numeric(12, 4), default=1.0, nullable=False)
    scrap_pct = Column(Numeric(5, 2), default=0.0, nullable=False)


class ManufacturingOrder(BaseEntity):
    __tablename__ = "mrp_production"
    reference = Column(String, nullable=False, unique=True, index=True)  # MO/2026/07/0001
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    bom_id = Column(Integer, ForeignKey("mrp_boms.id"), nullable=False)
    quantity = Column(Numeric(12, 3), nullable=False)
    date_planned = Column(Date, nullable=False)
    date_start = Column(Date, nullable=True)
    date_finished = Column(Date, nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Confirmed|In Progress|Done|Cancelled
    notes = Column(Text, nullable=True)


class WorkOrder(BaseEntity):
    __tablename__ = "mrp_work_orders"
    production_id = Column(Integer, ForeignKey("mrp_production.id"), nullable=False, index=True)
    operation_name = Column(String, nullable=False)
    work_center_id = Column(Integer, ForeignKey("mrp_work_centers.id"), nullable=False)
    sequence = Column(Integer, default=10, nullable=False)
    duration_planned = Column(Numeric(8, 2), nullable=False)
    duration_actual = Column(Numeric(8, 2), default=0.0, nullable=False)
    status = Column(String, default="Ready", nullable=False)  # Ready|In Progress|Paused|Finished


class EngineeringChangeOrder(BaseEntity):
    __tablename__ = "mrp_eco"
    reference = Column(String, nullable=False, unique=True, index=True)  # ECO/2026/001
    name = Column(String, nullable=False)
    bom_id = Column(Integer, ForeignKey("mrp_boms.id"), nullable=False)
    change_type = Column(String, nullable=False)  # add|remove|replace|routing
    description = Column(Text, nullable=True)
    status = Column(String, default="Draft", nullable=False)  # Draft|Approved|Rejected
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    effectivity_date = Column(Date, nullable=True)


class QualityInspection(BaseEntity):
    __tablename__ = "mrp_quality_inspections"
    reference = Column(String, nullable=False, unique=True, index=True)
    production_id = Column(Integer, ForeignKey("mrp_production.id"), nullable=False)
    work_order_id = Column(Integer, ForeignKey("mrp_work_orders.id"), nullable=True)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    result = Column(String, default="Pending", nullable=False)  # Pending|Passed|Failed
    notes = Column(Text, nullable=True)
