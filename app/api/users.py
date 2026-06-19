from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.assignment import Assignment
from app.models.asset import Asset
from app.schemas.user import UserResponse, UserCreate, UserUpdate, UserProfileUpdate
from app.core.dependencies import get_current_user
from datetime import datetime
from passlib.context import CryptContext
import uuid

router = APIRouter(tags=["Users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister tous les utilisateurs."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouvel utilisateur."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà utilisé"
        )
    
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        is_active=user_data.is_active if hasattr(user_data, 'is_active') else True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer un utilisateur par son ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


# ──────────────────────────────────────────────────────────────────────────
# ✅ NOUVEAU : Endpoint PUT /me (EF-05) - Mise à jour du profil personnel
# ──────────────────────────────────────────────────────────────────────────
@router.put("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_my_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mettre à jour son propre profil (EF-05).
    
    Un utilisateur peut modifier :
    - Son prénom (first_name)
    - Son nom (last_name)
    - Son mot de passe (password)
    
    L'email et le rôle ne peuvent PAS être modifiés par l'utilisateur lui-même.
    Seul l'administrateur peut modifier ces champs via PUT /users/{id}.
    """
    # Sauvegarder les anciennes valeurs pour l'audit
    before_data = {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
    }
    
    # Appliquer les modifications
    updated_fields = []
    
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
        updated_fields.append("first_name")
    
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
        updated_fields.append("last_name")
    
    if profile_data.password is not None:
        current_user.password_hash = pwd_context.hash(profile_data.password)
        updated_fields.append("password")
    
    # Si aucun champ fourni
    if not updated_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun champ à mettre à jour"
        )
    
    # Mettre à jour le timestamp
    current_user.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )
    
    # Générer un log d'audit (optionnel mais recommandé)
    try:
        from app.services.audit import create_audit_log
        create_audit_log(
            db=db,
            user_id=current_user.id,
            action="USER_PROFILE_UPDATED",
            entity_type="USER",
            entity_id=current_user.id,
            before_data=before_data,
            after_data={field: getattr(current_user, field) for field in updated_fields}
        )
    except Exception:
        pass  # Ne pas bloquer si l'audit échoue
    
    return current_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modifier un utilisateur (Admin uniquement ou soi-même).
    
    - Admin peut modifier tous les champs (email, rôle, etc.)
    - Un utilisateur ne peut modifier que son propre profil via PUT /me
    """
    # Vérification RBAC : seul l'admin peut modifier les autres utilisateurs
    if user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un administrateur peut modifier le profil d'un autre utilisateur"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Vérifier si l'email est déjà utilisé par un autre utilisateur
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email déjà utilisé par un autre utilisateur"
            )
        user.email = user_data.email
    
    if user_data.first_name:
        user.first_name = user_data.first_name
    if user_data.last_name:
        user.last_name = user_data.last_name
    if user_data.role:
        # Seul l'admin peut changer le rôle
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul un administrateur peut modifier le rôle d'un utilisateur"
            )
        user.role = user_data.role
    if user_data.is_active is not None:
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul un administrateur peut activer/désactiver un compte"
            )
        user.is_active = user_data.is_active
    if user_data.password:
        user.password_hash = pwd_context.hash(user_data.password)
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la modification: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer un utilisateur et retourner tous ses actifs affectés.
    Gère toutes les relations (assignments, audit logs, etc.)
    """
    # Empêcher la suppression de soi-même
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    # Seul l'admin peut supprimer
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un administrateur peut supprimer un utilisateur"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    try:
        # ÉTAPE 1 : Retourner tous les actifs affectés à cet utilisateur
        active_assignments = db.query(Assignment).filter(
            Assignment.employee_id == user_id,
            Assignment.returned_at == None
        ).all()
        
        for assignment in active_assignments:
            asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
            if asset:
                asset.status = "AVAILABLE"
        
        # ÉTAPE 2 : Supprimer TOUTES les affectations liées à cet utilisateur
        db.query(Assignment).filter(
            (Assignment.employee_id == user_id) | (Assignment.assigned_by == user_id)
        ).delete(synchronize_session=False)
        
        # ÉTAPE 3 : Supprimer les logs d'audit liés à cet utilisateur
        try:
            from app.models.audit_log import AuditLog
            db.query(AuditLog).filter(AuditLog.user_id == user_id).delete(synchronize_session=False)
        except Exception:
            pass
        
        # ÉTAPE 4 : Supprimer l'utilisateur
        db.delete(user)
        db.commit()
        
        return {
            "message": f"Utilisateur {user.first_name} {user.last_name} supprimé avec succès",
            "assets_returned": len(active_assignments)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )