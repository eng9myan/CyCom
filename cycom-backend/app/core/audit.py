import hashlib
import json
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def log_action(
    db: Session,
    *,
    user: Optional[User],
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    changes: Optional[dict] = None,
    company_id: Optional[int] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    # 1. Fetch latest log to get previous hash
    latest = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = latest.hash if (latest and latest.hash) else "GENESIS_ROOT"

    entry = AuditLog(
        company_id=company_id if company_id is not None else (user.company_id if user else None),
        user_id=user.id if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes,
        ip_address=ip_address,
        previous_hash=prev_hash
    )
    db.add(entry)
    db.flush()

    # 2. Compute SHA-256 hash of this entry
    payload = {
        "id": entry.id,
        "company_id": entry.company_id,
        "user_id": entry.user_id,
        "action": entry.action,
        "entity_type": entry.entity_type,
        "entity_id": entry.entity_id,
        "changes": entry.changes,
        "ip_address": entry.ip_address,
        "previous_hash": prev_hash
    }
    dump = json.dumps(payload, sort_keys=True, default=str)
    entry.hash = hashlib.sha256(dump.encode("utf-8")).hexdigest()

    db.commit()
    db.refresh(entry)
    return entry
