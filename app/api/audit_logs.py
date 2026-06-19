# app/api/audit_logs.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogResponse

router = APIRouter(tags=["Audit Logs"])


@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = Query(0, ge=0, description="Nombre d'éléments à ignorer"),
    limit: int = Query(50, ge=1, le=100, description="Nombre maximum d'éléments"),
    entity_type: Optional[str] = Query(None, description="Filtrer par type d'entité (ASSET, USER, CATEGORY)"),
    action: Optional[str] = Query(None, description="Filtrer par type d'action (ex: ASSET_CREATED)"),
    user_id: Optional[str] = Query(None, description="Filtrer par ID utilisateur"),
    start_date: Optional[datetime] = Query(None, description="Date de début"),
    end_date: Optional[datetime] = Query(None, description="Date de fin"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # ✅ Accès réservé aux admins (EF-20)
):
    """
    Liste paginée du journal d'audit avec filtres (EF-20).
    Seul l'administrateur peut consulter les logs d'audit.
    """
    query = db.query(AuditLog)
    
    # Application des filtres
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type.upper())
    
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    # Tri par date décroissante (plus récent en premier)
    query = query.order_by(AuditLog.created_at.desc())
    
    return query.offset(skip).limit(limit).all()


@router.get("/stats", response_model=dict)
def get_audit_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Statistiques du journal d'audit."""
    from sqlalchemy import func
    
    total = db.query(func.count(AuditLog.id)).scalar()
    today_count = db.query(func.count(AuditLog.id)).filter(
        func.date(AuditLog.created_at) == func.current_date()
    ).scalar()
    
    # Actions les plus fréquentes
    top_actions = db.query(
        AuditLog.action,
        func.count(AuditLog.id).label('count')
    ).group_by(AuditLog.action).order_by(func.count(AuditLog.id).desc()).limit(5).all()
    
    return {
        "total": total,
        "today": today_count,
        "top_actions": [{"action": a[0], "count": a[1]} for a in top_actions]
    }


@router.get("/{audit_log_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Détail d'une entrée du journal d'audit."""
    audit_log = db.query(AuditLog).filter(AuditLog.id == audit_log_id).first()
    
    if not audit_log:
        raise HTTPException(status_code=404, detail="Log d'audit non trouvé")
    
    return audit_log