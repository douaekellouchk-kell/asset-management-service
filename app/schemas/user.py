from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    """Schéma pour l'admin (modification complète d'un utilisateur)."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


# ✅ NOUVEAU : Schéma pour la mise à jour du profil personnel (EF-05)
class UserProfileUpdate(BaseModel):
    """
    Schéma pour la mise à jour du profil personnel (EF-05).
    Un utilisateur peut modifier : son prénom, son nom, son mot de passe.
    L'email et le rôle ne peuvent PAS être modifiés par l'utilisateur lui-même.
    """
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True