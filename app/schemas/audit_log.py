# app/schemas/audit_log.py
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AuditLogResponse(BaseModel):
    """Schéma pour afficher une entrée du journal d'audit."""
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    before_data: Optional[Any] = None
    after_data: Optional[Any] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    """Schéma interne pour créer une entrée d'audit (utilisé par le service)."""
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    before_data: Optional[Any] = None
    after_data: Optional[Any] = None
    ip_address: Optional[str] = None