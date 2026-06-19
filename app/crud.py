# app/crud.py
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate
from typing import List, Optional
import uuid

def get_assets(db: Session, skip: int = 0, limit: int = 50, search: Optional[str] = None) -> List[Asset]:
    query = db.query(Asset)
    if search:
        query = query.filter(Asset.name.ilike(f"%{search}%") | Asset.serial_number.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_asset(db: Session, asset_id: str) -> Optional[Asset]:
    return db.query(Asset).filter(Asset.id == asset_id).first()

def create_asset(db: Session, obj_in: AssetCreate) -> Asset:
    db_obj = Asset(id=str(uuid.uuid4()), **obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_asset(db: Session, asset_id: str, obj_in: AssetUpdate) -> Optional[Asset]:
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: str) -> bool:
    asset = get_asset(db, asset_id)
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True

def assign_asset(db: Session, asset_id: str, employee_id: str) -> Optional[Asset]:
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    asset.status = "ASSIGNED"
    # Note: ajustez selon votre modèle réel (champ assigned_to ou via table assignments)
    db.commit()
    db.refresh(asset)
    return asset

def return_asset(db: Session, asset_id: str, condition: str = "GOOD") -> Optional[Asset]:
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    asset.status = "AVAILABLE"
    db.commit()
    db.refresh(asset)
    return asset

def get_asset_history(db: Session, asset_id: str) -> List[dict]:
    # Retourne un historique simplifié (à adapter selon vos besoins réels)
    return []