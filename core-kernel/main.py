import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "cycom-backend")))

import logging
from typing import Any, Dict
from fastapi import FastAPI, BackgroundTasks, Depends, Request, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

import hashlib
from db import engine, Base, AuditLog, get_tenant_session
from registry import AppRegistry
from bus import EventBus
import orchestrator
import setup
import rpc
from auth import JWTManager, get_current_user, RoleChecker
from sync import EdgeSyncManager
from typing import List

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cycom-kernel")

# Initialize database tables on start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cycom Autonomous Micro-Kernel",
    description="Decoupled B2B ERP engine with CQRS event bus and JWT security",
    version="2026.2.0",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific B2B domains in staging/production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    """Global Security Audit Trail logger with cryptographic SHA-256 block chaining and JWT extraction."""
    method = request.method
    path = request.url.path
    response = await call_next(request)

    # Log any database state mutation action
    if method in ("POST", "PUT", "DELETE", "PATCH") and "/api/event" not in path and "/api/auth" not in path:
        # Extract user email from JWT Bearer token
        user_email = "anonymous@cycom.com"
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = JWTManager.decode(token)
                user_email = payload.get("email", "anonymous@cycom.com")
            except Exception:
                pass

        # Extract tenant ID from request headers for dynamic shard routing
        tenant_id_str = request.headers.get("X-Tenant-ID", "1")
        try:
            tenant_id = int(tenant_id_str)
        except ValueError:
            tenant_id = 1

        db = get_tenant_session(tenant_id)
        try:
            # Query last audit entry for this tenant to retrieve the previous hash
            prev_entry = db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id).order_by(AuditLog.id.desc()).first()
            prev_hash = prev_entry.current_hash if prev_entry else "0"

            action = f"{method} {path}"
            details = f"HTTP Response: {response.status_code}"

            # Calculate SHA-256 block hash for this audit entry linked to the previous block
            payload_str = f"{prev_hash}|{user_email}|{action}|{details}"
            current_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

            log_entry = AuditLog(
                user_email=user_email,
                action=action,
                details=details,
                tenant_id=tenant_id,
                company_id=1,
                prev_hash=prev_hash,
                current_hash=current_hash
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.error(f"Audit middleware failed to write to ledger: {str(e)}")
        finally:
            db.close()

    return response


app.include_router(orchestrator.router)
app.include_router(setup.router)
app.include_router(rpc.router)


class LoginPayload(BaseModel):
    email: str
    password: str


class SyncUploadPayload(BaseModel):
    edge_id: str
    batch: List[Dict[str, Any]]


class EventPayload(BaseModel):
    event_name: str
    payload: Dict[str, Any]


@app.post("/api/auth/login")
def login(payload: LoginPayload):
    """Exposes B2B JWT token generation."""
    # Simple simulated credential verify (extend with DB hashing)
    if payload.email.endswith("@cycom.com") and payload.password == "admin123":
        token = JWTManager.encode({"email": payload.email, "role": "admin"})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/sync/upload")
def sync_upload(payload: SyncUploadPayload, request: Request, user: dict = Security(get_current_user)):
    """Receives batch mutations uploaded by edge nodes using LWW resolution."""
    tenant_id_str = request.headers.get("X-Tenant-ID", "1")
    try:
        tenant_id = int(tenant_id_str)
    except ValueError:
        tenant_id = 1

    db = get_tenant_session(tenant_id)
    try:
        res = EdgeSyncManager.process_upward_sync(db, payload.edge_id, payload.batch, tenant_id, company_id=1)
        return res
    finally:
        db.close()


@app.get("/api/sync/download")
def sync_download(edge_id: str, last_sync_time: str, request: Request, user: dict = Security(get_current_user)):
    """Generates downward changes for edge nodes since specified timestamp."""
    tenant_id_str = request.headers.get("X-Tenant-ID", "1")
    try:
        tenant_id = int(tenant_id_str)
    except ValueError:
        tenant_id = 1

    db = get_tenant_session(tenant_id)
    try:
        try:
            last_timestamp = datetime.fromisoformat(last_sync_time.replace("Z", "+00:00"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ISO format for last_sync_time")

        res = EdgeSyncManager.generate_downward_delta(db, last_timestamp, tenant_id)
        return {"edge_id": edge_id, "delta": res}
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    """Bootstrap dynamic applications on micro-kernel startup."""
    # Active apps loaded from environment configuration
    env_apps = os.getenv("ACTIVE_APPS", "finance,crm,inventory,hr").split(",")
    active_apps = [a.strip() for a in env_apps if a.strip()]

    logger.info(f"Micro-kernel booting. Active apps registry sequence: {active_apps}")
    AppRegistry.hot_load_apps(active_apps)


@app.post("/api/event")
async def post_headless_event(event: EventPayload, background_tasks: BackgroundTasks):
    """Headless Event Bridge for stand-alone CyShop (POS) and CyMed integrations."""
    logger.info(f"Headless Event Bridge received event: {event.event_name}")
    # Enqueue publishing task to prevent blocking external systems
    background_tasks.add_task(EventBus.publish, event.event_name, event.payload)
    return {"status": "queued", "event": event.event_name}


@app.get("/api/kernel/status")
def kernel_status():
    """Return health check and loaded apps list."""
    return {
        "status": "online",
        "loaded_apps": AppRegistry.get_active_apps(),
    }
