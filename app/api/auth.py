# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

# Imports locaux
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User

# ⚠️ IMPORTANT : PAS de prefix="/auth" ici !
# Le préfixe sera ajouté dans main.py lors de l'inclusion du router.
router = APIRouter(tags=["Authentication"])


# ──────────────────────────────────────────────────────────
# SCHEMAS (Pydantic)
# ──────────────────────────────────────────────────────────

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse, tags=["Authentication"])
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authentification utilisateur par email/mot de passe."""
    try:
        user = db.query(User).filter(User.email == credentials.email).first()
        
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Compte désactivé"
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne du serveur lors de l'authentification"
        )


@router.post("/refresh", response_model=TokenResponse, tags=["Authentication"])
def refresh_token(
    current_user: User = Depends(get_current_user)
):
    """Renouvellement du token JWT avant expiration."""
    try:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(current_user.id), "role": current_user.role},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer"
        )
    except Exception as e:
        print(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du rafraîchissement du token"
        )


@router.get("/me", response_model=UserResponse, tags=["Authentication"])
def get_me(
    current_user: User = Depends(get_current_user)
):
    """Récupérer les informations de l'utilisateur connecté."""
    return current_user


@router.post("/seed-admin", tags=["Authentication"])
def seed_admin(
    db: Session = Depends(get_db)
):
    """
    Créer un utilisateur admin de test.
    
    ⚠️ PUBLIC : Cet endpoint NE nécessite PAS d'authentification.
    À SUPPRIMER en production !
    
    - **Email**: admin@test.com
    - **Mot de passe**: admin123
    """
    # Vérifier si l'admin existe déjà
    existing = db.query(User).filter(User.email == "admin@test.com").first()
    
    if existing:
        return {
            "message": "Admin déjà existant",
            "email": "admin@test.com"
        }
    
    # Générer le hash du mot de passe
    hashed_password = get_password_hash("admin123")
    
    # Créer le nouvel utilisateur admin
    new_admin = User(
        id=str(uuid.uuid4()),
        email="admin@test.com",
        password_hash=hashed_password,
        first_name="Admin",
        last_name="User",
        role="ADMIN",
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return {
        "message": "Admin créé avec succès",
        "email": "admin@test.com",
        "password": "admin123",
        "warning": "Cet endpoint doit être supprimé en production"
    }