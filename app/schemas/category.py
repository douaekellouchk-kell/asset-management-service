# backend/app/schemas/category.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str  # ✅ str, pas UUID
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
