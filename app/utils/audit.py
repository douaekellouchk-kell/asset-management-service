# app/utils/audit.py
from functools import wraps
from fastapi import Request
from sqlalchemy.orm import Session
from app.services.audit_service import audit_service
from typing import Optional, Callable, Any


def audit_log(action: str, entity_type: str):
    """
    Décorateur pour générer automatiquement un log d'audit.
    
    Usage:
        @router.post("/assets")
        @audit_log("ASSET_CREATED", "ASSET")
        def create_asset(...):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Exécuter la fonction originale
            result = func(*args, **kwargs)
            
            # Extraire les paramètres nécessaires
            db = None
            current_user = None
            request = None
            
            for arg in args:
                if isinstance(arg, Session):
                    db = arg
                elif hasattr(arg, 'id'):  # User object
                    current_user = arg
                elif isinstance(arg, Request):
                    request = arg
            
            # Si on a une session DB, on commit le log
            if db and current_user:
                entity_id = None
                
                # Essayer d'extraire l'ID du résultat
                if hasattr(result, 'id'):
                    entity_id = str(result.id)
                elif isinstance(result, dict) and 'id' in result:
                    entity_id = str(result['id'])
                
                if entity_id:
                    ip_address = None
                    if request:
                        ip_address = request.client.host if request.client else None
                    
                    audit_service.log_action(
                        db=db,
                        action=action,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        user_id=current_user.id,
                        ip_address=ip_address
                    )
            
            return result
        return wrapper
    return decorator