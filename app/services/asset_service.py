from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.asset_repository import AssetRepository
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from app.models.user import User, UserRole
from app.models.asset import AssetStatus
from app.models.category import Category  # ← Import ajouté en haut
from typing import List, Optional
from uuid import UUID

class AssetService:
    def __init__(self, db: Session):
        self.repo = AssetRepository(db)
        self.db = db  # ← Stocker db pour les requêtes directes

    def _check_permission(self, current_user: User, required_roles: List[str]):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{','.join(required_roles)} access required"
            )

    def get_assets(self, current_user: User, skip: int = 0, limit: int = 50,
                   category_id: Optional[UUID] = None, status: Optional[str] = None,
                   search: Optional[str] = None) -> List[AssetResponse]:
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        assets = self.repo.get_all(skip=skip, limit=limit, category_id=category_id, 
                                   status=status, search=search)
        return [AssetResponse.model_validate(a) for a in assets]

    def get_asset(self, current_user: User, asset_id: UUID) -> AssetResponse:
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        asset = self.repo.get_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        return AssetResponse.model_validate(asset)

    def create_asset(self, current_user: User, asset_data: AssetCreate) -> AssetResponse:
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        
        #  Vérifier que la catégorie existe
        if not self.db.query(Category).filter(Category.id == asset_data.category_id).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
        asset = self.repo.create(**asset_data.model_dump())
        return AssetResponse.model_validate(asset)

    def update_asset(self, current_user: User, asset_id: UUID, asset_update: AssetUpdate) -> AssetResponse:
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        asset = self.repo.get_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        updated = self.repo.update(asset, **asset_update.model_dump(exclude_unset=True))
        return AssetResponse.model_validate(updated)

    def delete_asset(self, current_user: User, asset_id: UUID) -> bool:
        self._check_permission(current_user, [UserRole.ADMIN.value])
        asset = self.repo.get_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        self.repo.delete(asset)
        return True

    def assign_asset(self, current_user: User, asset_id: UUID, employee_id: UUID, notes: Optional[str] = None):
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        asset = self.repo.get_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        if asset.status != AssetStatus.AVAILABLE.value:
            raise HTTPException(status_code=400, detail="Asset is not available for assignment")
        return self.repo.assign(asset, employee_id, current_user.id, notes)

    def return_asset(self, current_user: User, asset_id: UUID, return_condition: str, notes: Optional[str] = None):
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        asset = self.repo.get_by_id(asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        if asset.status != AssetStatus.ASSIGNED.value:
            raise HTTPException(status_code=400, detail="Asset is not currently assigned")
        return self.repo.return_asset(asset, return_condition, notes)

    def get_history(self, current_user: User, asset_id: UUID) -> List:
        self._check_permission(current_user, [UserRole.ADMIN.value, UserRole.MANAGER.value])
        return self.repo.get_history(asset_id)