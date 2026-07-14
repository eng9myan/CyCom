"""
Audit Trail Chain Verification and Testing Router.
"""
import hashlib
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.core.dependencies import require_permission
from app.models.user import User

router = APIRouter()


def _compute_hash(log: AuditLog, prev_hash: str) -> str:
    # Serialize row fields deterministically
    payload = {
        "id": log.id,
        "company_id": log.company_id,
        "user_id": log.user_id,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "changes": log.changes,
        "ip_address": log.ip_address,
        "previous_hash": prev_hash
    }
    dump = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(dump.encode("utf-8")).hexdigest()


@router.post("/rebuild-hashes")
def rebuild_audit_hashes(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("settings.write"))
):
    """Initializes/rebuilds hash chains for all existing audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    prev_hash = "GENESIS_ROOT"
    
    for l in logs:
        l.previous_hash = prev_hash
        l.hash = _compute_hash(l, prev_hash)
        prev_hash = l.hash
        
    db.commit()
    return {"message": "Audit chain hashes successfully built", "count": len(logs)}


@router.post("/verify")
def verify_audit_chain(
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("settings.read"))
):
    """Traverses and validates the integrity of the audit logs chain."""
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    prev_hash = "GENESIS_ROOT"
    errors = []

    for l in logs:
        # Check previous_hash link
        if l.previous_hash != prev_hash:
            errors.append({
                "log_id": l.id,
                "error_type": "chain_link_broken",
                "expected_prev": prev_hash,
                "actual_prev": l.previous_hash
            })
            
        # Verify current hash matches row contents
        computed = _compute_hash(l, l.previous_hash or "GENESIS_ROOT")
        if l.hash != computed:
            errors.append({
                "log_id": l.id,
                "error_type": "hash_mismatch",
                "expected_hash": computed,
                "actual_hash": l.hash
            })
            
        prev_hash = l.hash or computed

    return {
        "is_valid": len(errors) == 0,
        "verified_count": len(logs),
        "errors": errors
    }


@router.post("/tamper")
def simulate_tampering(
    log_id: int,
    action: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("settings.write"))
):
    """Simulates unauthorized database modification to prove validation engine detection."""
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(404, "Audit log not found")
        
    # Tamper with action value directly bypass hash recalculations
    log.action = action
    db.commit()
    return {"message": "Audit log tampered successfully", "log_id": log_id, "new_action": action}
