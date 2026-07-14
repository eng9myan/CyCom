"""
Business Intelligence & Reporting (BI) Router.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.dependencies import require_permission
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


@router.post("/query")
def execute_bi_query(
    payload: Dict[str, str],
    db: Session = Depends(get_db),
    user: User = Depends(require_permission("settings.write"))
):
    """Executes safe SELECT-only SQL queries for BI reporting."""
    query_str = payload.get("query", "").strip()
    if not query_str:
        raise HTTPException(status_code=400, detail="Query string cannot be empty")

    # Security validation: enforce SELECT-only to prevent SQL injection schema damage
    upper_query = query_str.upper()
    forbidden_tokens = ["INSERT ", "UPDATE ", "DELETE ", "DROP ", "ALTER ", "TRUNCATE ", "REPLACE ", "CREATE ", "GRANT "]
    if any(token in upper_query for token in forbidden_tokens) or not upper_query.startswith("SELECT"):
        raise HTTPException(status_code=403, detail="Unauthorized query type. Only SELECT statements are permitted.")

    try:
        res = db.execute(text(query_str))
        columns = list(res.keys())
        rows = [dict(zip(columns, row)) for row in res.fetchall()]
        return {"columns": columns, "rows": rows}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
