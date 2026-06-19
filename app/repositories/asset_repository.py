from sqlalchemy.orm import Session
from app.models.asset import Asset, AssetStatus
from app.models.category import Category
from typing import Optional, List
from uuid import UUID
from datetime import date

class AssetRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, 
                category_id: Optional[UUID] = None,
                status: Optional[str] = None,
                search: Optional[str] = None) -> List[Asset]:
        query = self.db.query(Asset).filter(Asset.is_deleted == False)
        
        if category_id:
            query = query.filter(Asset.category_id == category_id)
        if status:
            query = query.filter(Asset.status == status)
        if search:
            query = query.filter(
                Asset.name.ilike(f"%{search}%") | 
                Asset.serial_number.ilike(f"%{search}%") |
                Asset.description.ilike(f"%{search}%")
            )
        
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, asset_id: UUID) -> Optional[Asset]:
        return self.db.query(Asset).filter(
            Asset.id == asset_id, 
            Asset.is_deleted == False
        ).first()

    def create(self, name: str, category_id: UUID, **kwargs) -> Asset:
        asset = Asset(name=name, category_id=category_id, **kwargs)
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def update(self, asset: Asset, **kwargs) -> Asset:
        for key, value in kwargs.items():
            if value is not None:
                setattr(asset, key, value)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def delete(self, asset: Asset) -> Asset:
        asset.is_deleted = True
        asset.status = AssetStatus.RETIRED.value
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def assign(self, asset: Asset, employee_id: UUID, assigned_by: UUID, notes: Optional[str] = None):
        from app.models.assignment import Assignment
        assignment = Assignment(
            asset_id=asset.id,
            employee_id=employee_id,
            assigned_by=assigned_by,
            notes=notes
        )
        asset.status = AssetStatus.ASSIGNED.value
        self.db.add(assignment)
        self.db.commit()
        return assignment

    def return_asset(self, asset: Asset, return_condition: str, notes: Optional[str] = None):
        from app.models.assignment import Assignment, ReturnCondition
        # Trouver l'assignation active
        active_assignment = self.db.query(Assignment).filter(
            Assignment.asset_id == asset.id,
            Assignment.returned_at == None
        ).first()
        
        if active_assignment:
            active_assignment.returned_at = date.today()
            active_assignment.return_condition = return_condition
            active_assignment.notes = notes
            asset.status = AssetStatus.AVAILABLE.value
            self.db.commit()
        return active_assignment

    def get_history(self, asset_id: UUID) -> List:
        from app.models.assignment import Assignment
        return self.db.query(Assignment).filter(
            Assignment.asset_id == asset_id
        ).order_by(Assignment.assigned_at.desc()).all()