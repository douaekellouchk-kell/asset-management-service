from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.category import Category
from pydantic import BaseModel

router = APIRouter()

class CategoryOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

@router.get('', response_model=List[CategoryOut], tags=['Categories'])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Category).all()
    return categories

@router.post('', response_model=CategoryOut, status_code=status.HTTP_201_CREATED, tags=['Categories'])
def create_category(
    name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Cette catégorie existe déjà'
        )
    
    new_category = Category(
        name=name,
        description=description
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category