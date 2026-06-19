# app/api/assignments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.asset import Asset
from app.models.assignment import Assignment

router = APIRouter(prefix="/assignments", tags=["Assignments"])


# ──────────────────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────────────────

class AssignmentOut(BaseModel):
    id: str
    asset_id: str
    employee_id: str
    assigned_by: str
    assigned_at: datetime
    returned_at: Optional[datetime] = None
    return_condition: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class MyAssetOut(BaseModel):
    """Schéma pour la vue employé - Mes actifs"""
    assignment_id: str
    asset_id: str
    asset_name: str
    asset_serial_number: str
    category_name: Optional[str] = None
    purchase_value: float
    status: str
    assigned_at: datetime
    notes: Optional[str] = None


class AssignmentStats(BaseModel):
    total_assignments: int
    active_assignments: int
    returned_assignments: int
    assignments_by_employee: List[dict]


# ──────────────────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────────────────

@router.get("", response_model=List[AssignmentOut])
def list_assignments(
    skip: int = 0,
    limit: int = 50,
    employee_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister toutes les affectations avec filtres."""
    query = db.query(Assignment)
    
    # Filtres
    if employee_id:
        query = query.filter(Assignment.employee_id == employee_id)
    
    if asset_id:
        query = query.filter(Assignment.asset_id == asset_id)
    
    if active_only:
        query = query.filter(Assignment.returned_at == None)
    
    # Tri par date décroissante
    assignments = query.order_by(Assignment.assigned_at.desc()).offset(skip).limit(limit).all()
    return assignments


@router.get("/stats", response_model=AssignmentStats)
def get_assignment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Statistiques des affectations."""
    from sqlalchemy import func
    
    total = db.query(func.count(Assignment.id)).scalar()
    active = db.query(func.count(Assignment.id)).filter(Assignment.returned_at == None).scalar()
    returned = total - active
    
    # Top employés avec le plus d'actifs
    top_employees = db.query(
        Assignment.employee_id,
        func.count(Assignment.id).label('count')
    ).filter(
        Assignment.returned_at == None
    ).group_by(Assignment.employee_id).order_by(
        func.count(Assignment.id).desc()
    ).limit(5).all()
    
    assignments_by_employee = []
    for emp_id, count in top_employees:
        employee = db.query(User).filter(User.id == emp_id).first()
        if employee:
            assignments_by_employee.append({
                "employee_id": emp_id,
                "employee_name": f"{employee.first_name} {employee.last_name}",
                "email": employee.email,
                "active_assets": count
            })
    
    return {
        "total_assignments": total,
        "active_assignments": active,
        "returned_assignments": returned,
        "assignments_by_employee": assignments_by_employee
    }


@router.get("/my-assets", response_model=List[MyAssetOut])
def get_my_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Liste des actifs actuellement affectés à l'utilisateur connecté.
    ✅ Accessible à TOUS les rôles (pas seulement EMPLOYEE)
    - EMPLOYEE : voit uniquement ses propres actifs
    - MANAGER/ADMIN : peut aussi voir ses propres actifs s'il en a
    """
    # Récupérer les affectations actives de l'utilisateur
    assignments = db.query(Assignment).filter(
        Assignment.employee_id == current_user.id,
        Assignment.returned_at == None
    ).order_by(Assignment.assigned_at.desc()).all()
    
    # Construire la réponse avec les détails des actifs
    result = []
    for assignment in assignments:
        asset = db.query(Asset).options(joinedload(Asset.category)).filter(
            Asset.id == assignment.asset_id,
            Asset.is_deleted == False
        ).first()
        
        if asset:
            result.append({
                "assignment_id": assignment.id,
                "asset_id": asset.id,
                "asset_name": asset.name,
                "asset_serial_number": asset.serial_number,
                "category_name": asset.category.name if asset.category else None,
                "purchase_value": float(asset.purchase_value) if asset.purchase_value else 0.0,
                "status": asset.status,
                "assigned_at": assignment.assigned_at,
                "notes": assignment.notes
            })
    
    return result


@router.get("/my-history", response_model=List[AssignmentOut])
def get_my_assignment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Historique complet de toutes les affectations de l'utilisateur connecté."""
    assignments = db.query(Assignment).filter(
        Assignment.employee_id == current_user.id
    ).order_by(Assignment.assigned_at.desc()).all()
    
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Détail d'une affectation spécifique."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Affectation non trouvée")
    
    # Un employé ne peut voir que ses propres affectations
    if current_user.role == "EMPLOYEE" and assignment.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return assignment