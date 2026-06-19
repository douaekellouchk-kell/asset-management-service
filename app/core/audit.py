from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User
import uuid
from datetime import datetime

def create_audit_log(
    db: Session,
    user: User,
    action: str,
    entity_type: str,
    entity_id: str,
    description: str = None,
    changes: dict = None
):
    """Crée un entry dans les logs d'audit"""
    audit = AuditLog(
        id=str(uuid.uuid4()),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user.id,
        user_email=user.email,
        description=description or f"{action} on {entity_type}",
        changes=changes
    )
    db.add(audit)
    db.commit()
    return audit