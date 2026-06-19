from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.schemas.category import CategoryResponse

class AssetBase(BaseModel):
    name: str
    description: Optional[str] = None
    serial_number: str
    category_id: str
    purchase_value: float
    purchase_date: Optional[datetime] = None
    status: str = "AVAILABLE"

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    serial_number: Optional[str] = None
    category_id: Optional[str] = None
    purchase_value: Optional[float] = None
    purchase_date: Optional[datetime] = None
    status: Optional[str] = None
    is_deleted: Optional[bool] = None

class AssetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    serial_number: str
    category_id: str
    purchase_value: float
    purchase_date: Optional[datetime]
    status: str
    is_deleted: bool
    created_at: datetime
    updated_at: Optional[datetime]
    category: Optional['CategoryResponse'] = None

    class Config:
        from_attributes = True