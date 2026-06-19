from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.asset import Asset
from app.models.category import Category
from pydantic import BaseModel

router = APIRouter()

class AssetCreate(BaseModel):
    name: str
    serial_number: str
    category_id: UUID
    purchase_value: float
    description: Optional[str] = None

class CategoryOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class AssetOut(BaseModel):
    id: UUID
    name: str
    serial_number: str
    category_id: UUID
    purchase_value: float
    description: Optional[str] = None
    status: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True

@router.get('', response_model=List[AssetOut], tags=['Assets'])
def list_assets(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Asset).options(joinedload(Asset.category)).filter(Asset.is_deleted == False)
    if search:
        query = query.filter(
            (Asset.name.ilike(f'%{search}%')) |
            (Asset.serial_number.ilike(f'%{search}%'))
        )
    assets = query.offset(skip).limit(limit).all()
    return assets

@router.post('', response_model=AssetOut, status_code=status.HTTP_201_CREATED, tags=['Assets'])
def create_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Asset).filter(
        Asset.serial_number == asset.serial_number,
        Asset.is_deleted == False
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Ce numéro de série existe déjà'
        )
    
    new_asset = Asset(
        name=asset.name,
        serial_number=asset.serial_number,
        category_id=asset.category_id,
        purchase_value=asset.purchase_value,
        description=asset.description,
        status='AVAILABLE'
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    return new_asset

@router.put('/{asset_id}', response_model=AssetOut, tags=['Assets'])
def update_asset(
    asset_id: str,
    asset_update: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.is_deleted == False
    ).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Actif non trouvé'
        )
    
    asset.name = asset_update.name
    asset.serial_number = asset_update.serial_number
    asset.category_id = asset_update.category_id
    asset.purchase_value = asset_update.purchase_value
    asset.description = asset_update.description
    
    db.commit()
    db.refresh(asset)
    return asset

@router.delete('/{asset_id}', status_code=status.HTTP_204_NO_CONTENT, tags=['Assets'])
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.is_deleted == False
    ).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Actif non trouvé'
        )
    
    asset.is_deleted = True
    db.commit()
    return None