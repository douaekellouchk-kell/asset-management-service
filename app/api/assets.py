# app/api/assets.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid

from fastapi.responses import Response
import io
import csv
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.asset import Asset
from app.models.assignment import Assignment
from app.services.audit_service import audit_service

router = APIRouter(tags=["Assets"])


# ──────────────────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────────────────

class AssetCreate(BaseModel):
    name: str
    serial_number: str
    category_id: str
    purchase_value: float
    description: Optional[str] = None
    purchase_date: Optional[datetime] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    category_id: Optional[str] = None
    purchase_value: Optional[float] = None
    description: Optional[str] = None
    purchase_date: Optional[datetime] = None
    status: Optional[str] = None


class CategoryOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


class AssetOut(BaseModel):
    id: str
    name: str
    serial_number: str
    category_id: str
    purchase_value: float
    description: Optional[str] = None
    status: str
    is_deleted: bool
    purchase_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    category: Optional[CategoryOut] = None
    
    class Config:
        from_attributes = True


class AssignRequest(BaseModel):
    employee_id: str
    notes: Optional[str] = None


class ReturnRequest(BaseModel):
    return_condition: str = "GOOD"
    notes: Optional[str] = None


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


# ──────────────────────────────────────────────────────────
# ROUTES CRUD (sans paramètre d'URL)
# ──────────────────────────────────────────────────────────

@router.get("")
def list_assets(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    category_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister tous les actifs avec filtres et pagination (EF-11, EF-22, EF-23, EF-24, EF-25)."""
    query = db.query(Asset).options(joinedload(Asset.category)).filter(Asset.is_deleted == False)
    
    # Recherche par nom ou numéro de série (EF-22)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Asset.name.ilike(search_pattern)) |
            (Asset.serial_number.ilike(search_pattern))
        )
    
    # Filtrage par statut (EF-23)
    if status_filter:
        query = query.filter(Asset.status == status_filter.upper())
    
    # Filtrage par catégorie
    if category_id:
        query = query.filter(Asset.category_id == category_id)
    
    # Filtrage par employé affecté (EF-24)
    if employee_id:
        assigned_asset_ids = db.query(Assignment.asset_id).filter(
            Assignment.employee_id == employee_id,
            Assignment.returned_at == None
        ).subquery()
        
        query = query.filter(Asset.id.in_(assigned_asset_ids))
    
    # Compter le total AVANT la pagination
    total = query.count()
    
    # Appliquer la pagination
    assets = query.order_by(Asset.created_at.desc()).offset(skip).limit(limit).all()
    
    # Retourner les données avec le total
    return {
        "items": assets,
        "total": total,
        "skip": skip,
        "limit": limit
    }


# ✅ CORRECTION : Endpoint /stats correctement indenté (au même niveau que list_assets)
@router.get("/stats")
def get_assets_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retourner les statistiques globales des actifs."""
    # Total des actifs
    total = db.query(Asset).filter(Asset.is_deleted == False).count()
    
    # Disponibles
    available = db.query(Asset).filter(
        Asset.is_deleted == False,
        Asset.status == "AVAILABLE"
    ).count()
    
    # Affectés
    assigned = db.query(Asset).filter(
        Asset.is_deleted == False,
        Asset.status == "ASSIGNED"
    ).count()
    
    # Valeur totale
    total_value_result = db.query(func.sum(Asset.purchase_value)).filter(
        Asset.is_deleted == False
    ).scalar() or 0
    
    return {
        "total": total,
        "available": available,
        "assigned": assigned,
        "total_value": float(total_value_result)
    }


@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
def create_asset(
    asset: AssetCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouvel actif avec audit (EF-08)."""
    existing = db.query(Asset).filter(
        Asset.serial_number == asset.serial_number,
        Asset.is_deleted == False
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce numéro de série existe déjà"
        )
    
    new_asset = Asset(
        id=str(uuid.uuid4()),
        name=asset.name,
        serial_number=asset.serial_number,
        category_id=asset.category_id,
        purchase_value=asset.purchase_value,
        description=asset.description,
        purchase_date=asset.purchase_date,
        status="AVAILABLE",
        is_deleted=False
    )
    
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    audit_service.log_action(
        db=db,
        action="ASSET_CREATED",
        entity_type="ASSET",
        entity_id=new_asset.id,
        user_id=current_user.id,
        after_data=new_asset,
        ip_address=request.client.host if request.client else None
    )
    
    db.refresh(new_asset)
    return new_asset


# ──────────────────────────────────────────────────────────
# EXPORT CSV - DOIT ÊTRE AVANT /{asset_id}
# ──────────────────────────────────────────────────────────

@router.get("/export/csv")
def export_assets_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exporter tous les actifs en format CSV compatible Excel."""
    assets = db.query(Asset).options(joinedload(Asset.category)).filter(
        Asset.is_deleted == False
    ).all()
    
    output = io.StringIO()
    output.write('\ufeff')
    
    writer = csv.writer(output, delimiter=',', quoting=csv.QUOTE_ALL)
    
    writer.writerow([
        "Nom",
        "Numero de Serie",
        "Categorie",
        "Statut",
        "Valeur d'Achat (MAD)",
        "Description",
        "Date d'Achat"
    ])
    
    for asset in assets:
        writer.writerow([
            asset.name,
            asset.serial_number,
            asset.category.name if asset.category else "N/A",
            asset.status,
            f"{asset.purchase_value:.2f}" if asset.purchase_value else "0",
            asset.description or "",
            asset.purchase_date.strftime("%Y-%m-%d") if asset.purchase_date else ""
        ])
    
    return Response(
        content=output.getvalue().encode('utf-8-sig'),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename=assets_export_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


# ──────────────────────────────────────────────────────────
# ROUTES AVEC PARAMÈTRE {asset_id}
# ──────────────────────────────────────────────────────────

@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer le détail d'un actif (EF-12)."""
    asset = db.query(Asset).options(joinedload(Asset.category)).filter(
        Asset.id == asset_id,
        Asset.is_deleted == False
    ).first()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    return asset


@router.put("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: str,
    asset_update: AssetUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifier un actif avec audit (EF-09)."""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    before_data = {
        "name": asset.name,
        "serial_number": asset.serial_number,
        "category_id": asset.category_id,
        "purchase_value": float(asset.purchase_value) if asset.purchase_value else None,
        "description": asset.description,
        "status": asset.status
    }
    
    if asset_update.name is not None:
        asset.name = asset_update.name
    if asset_update.serial_number is not None:
        asset.serial_number = asset_update.serial_number
    if asset_update.category_id is not None:
        asset.category_id = asset_update.category_id
    if asset_update.purchase_value is not None:
        asset.purchase_value = asset_update.purchase_value
    if asset_update.description is not None:
        asset.description = asset_update.description
    if asset_update.purchase_date is not None:
        asset.purchase_date = asset_update.purchase_date
    if asset_update.status is not None:
        asset.status = asset_update.status
    
    asset.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(asset)
    
    audit_service.log_action(
        db=db,
        action="ASSET_UPDATED",
        entity_type="ASSET",
        entity_id=asset_id,
        user_id=current_user.id,
        before_data=before_data,
        after_data=asset,
        ip_address=request.client.host if request.client else None
    )
    
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_200_OK)
def delete_asset(
    asset_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Suppression logique d'un actif avec audit (EF-10)."""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    before_data = {
        "name": asset.name,
        "serial_number": asset.serial_number,
        "status": asset.status,
        "is_deleted": asset.is_deleted
    }
    
    asset.is_deleted = True
    asset.updated_at = datetime.utcnow()
    
    db.commit()
    
    audit_service.log_action(
        db=db,
        action="ASSET_DELETED",
        entity_type="ASSET",
        entity_id=asset_id,
        user_id=current_user.id,
        before_data=before_data,
        ip_address=request.client.host if request.client else None
    )
    
    return {"message": "Actif supprimé avec succès"}


# ──────────────────────────────────────────────────────────
# AFFECTATION & RETOUR
# ──────────────────────────────────────────────────────────

@router.post("/{asset_id}/assign", response_model=AssetOut)
def assign_asset(
    asset_id: str,
    assign_request: AssignRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Affecter un actif à un employé avec audit (EF-13, EF-15)."""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    if asset.status != "AVAILABLE":
        raise HTTPException(
            status_code=400,
            detail=f"L'actif n'est pas disponible (statut actuel: {asset.status})"
        )
    
    employee = db.query(User).filter(User.id == assign_request.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    if employee.role != "EMPLOYEE":
        raise HTTPException(status_code=400, detail="L'utilisateur n'est pas un employé")
    
    assignment = Assignment(
        id=str(uuid.uuid4()),
        asset_id=asset_id,
        employee_id=assign_request.employee_id,
        assigned_by=current_user.id,
        assigned_at=datetime.utcnow(),
        notes=assign_request.notes
    )
    
    asset.status = "ASSIGNED"
    asset.updated_at = datetime.utcnow()
    
    db.add(assignment)
    db.commit()
    db.refresh(asset)
    
    audit_service.log_action(
        db=db,
        action="ASSET_ASSIGNED",
        entity_type="ASSET",
        entity_id=asset_id,
        user_id=current_user.id,
        before_data={"status": "AVAILABLE", "employee_id": None},
        after_data={
            "status": "ASSIGNED",
            "employee_id": assign_request.employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "assigned_by": current_user.id
        },
        ip_address=request.client.host if request.client else None
    )
    
    db.refresh(asset)
    return asset


@router.post("/{asset_id}/return", response_model=AssetOut)
def return_asset(
    asset_id: str,
    return_request: ReturnRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retourner un actif affecté avec audit (EF-16, EF-17)."""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    if asset.status != "ASSIGNED":
        raise HTTPException(
            status_code=400,
            detail=f"L'actif n'est pas affecté (statut actuel: {asset.status})"
        )
    
    active_assignment = db.query(Assignment).filter(
        Assignment.asset_id == asset_id,
        Assignment.returned_at == None
    ).first()
    
    if not active_assignment:
        raise HTTPException(status_code=404, detail="Affectation active non trouvée")
    
    before_data = {
        "status": "ASSIGNED",
        "employee_id": active_assignment.employee_id,
        "assigned_at": active_assignment.assigned_at.isoformat() if active_assignment.assigned_at else None
    }
    
    active_assignment.returned_at = datetime.utcnow()
    active_assignment.return_condition = return_request.return_condition.upper()
    if return_request.notes:
        active_assignment.notes = (active_assignment.notes or "") + f"\n[Retour] {return_request.notes}"
    
    if return_request.return_condition.upper() == "DAMAGED":
        asset.status = "DAMAGED"
    elif return_request.return_condition.upper() == "LOST":
        asset.status = "RETIRED"
    else:
        asset.status = "AVAILABLE"
    
    asset.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(asset)
    
    audit_service.log_action(
        db=db,
        action="ASSET_RETURNED",
        entity_type="ASSET",
        entity_id=asset_id,
        user_id=current_user.id,
        before_data=before_data,
        after_data={
            "status": asset.status,
            "return_condition": return_request.return_condition,
            "returned_at": active_assignment.returned_at.isoformat()
        },
        ip_address=request.client.host if request.client else None
    )
    
    db.refresh(asset)
    return asset


# ──────────────────────────────────────────────────────────
# HISTORIQUE (EF-21)
# ──────────────────────────────────────────────────────────

@router.get("/{asset_id}/history", response_model=List[AssignmentOut])
def asset_history(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Historique complet des affectations d'un actif (EF-21)."""
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.is_deleted == False).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Actif non trouvé")
    
    assignments = db.query(Assignment).filter(
        Assignment.asset_id == asset_id
    ).order_by(Assignment.assigned_at.desc()).all()
    
    return assignments