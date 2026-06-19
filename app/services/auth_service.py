# app/services/auth_service.py
from fastapi import HTTPException, status
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    def authenticate(self, email: str, password: str) -> str:
        """Authentifie un utilisateur et retourne un token JWT"""
        user = self.user_repo.get_by_email(email)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants invalides ou compte désactivé",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # ⚠️ CORRECTION ICI : Utiliser 'hashed_password', PAS 'password_hash'
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants invalides",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Créer le token JWT
        return create_access_token(
            data={"sub": user.email, "role": user.role},
            expires_delta=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )