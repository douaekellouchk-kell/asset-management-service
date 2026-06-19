# app/services/audit_service.py
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional, Any
from decimal import Decimal
from datetime import datetime, date
from uuid import UUID
import json


class AuditService:
    """Service de gestion du journal d'audit (EF-18, EF-19)."""
    
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: str,
        user_id: Optional[str] = None,
        before_data: Optional[Any] = None,
        after_data: Optional[Any] = None,
        ip_address: Optional[str] = None
    ):
        """Enregistrer une action dans le journal d'audit."""
        try:
            # Convertir les objets en dict si nécessaire
            before_dict = AuditService._serialize_data(before_data)
            after_dict = AuditService._serialize_data(after_data)
            
            audit_log = AuditLog(
                id=str(UUID(int=__import__('uuid').uuid4().int)),
                user_id=user_id,
                action=action.upper(),
                entity_type=entity_type.upper(),
                entity_id=entity_id,
                before_data=before_dict,
                after_data=after_dict,
                ip_address=ip_address
            )
            
            db.add(audit_log)
            db.commit()
            return audit_log
        except Exception as e:
            # ✅ IMPORTANT : Rollback pour ne pas bloquer la transaction principale
            try:
                db.rollback()
            except Exception:
                pass
            print(f"⚠️ Failed to create audit log: {e}")
            return None
    
    @staticmethod
    def _serialize_data(data: Any) -> Optional[dict]:
        """Convertir un objet en dictionnaire sérialisable en JSON."""
        if data is None:
            return None
        
        if isinstance(data, dict):
            return AuditService._make_json_safe(data)
        
        # Si c'est un modèle SQLAlchemy
        if hasattr(data, '__table__'):
            result = {}
            for column in data.__table__.columns:
                value = getattr(data, column.name, None)
                result[column.name] = AuditService._convert_value(value)
            return result
        
        return None
    
    @staticmethod
    def _make_json_safe(data: dict) -> dict:
        """Rendre un dictionnaire sérialisable en JSON."""
        result = {}
        for key, value in data.items():
            result[key] = AuditService._convert_value(value)
        return result
    
    @staticmethod
    def _convert_value(value: Any) -> Any:
        """Convertir une valeur en type JSON-safe."""
        if value is None:
            return None
        
        # ✅ Decimal → float (résout l'erreur principale)
        if isinstance(value, Decimal):
            return float(value)
        
        # ✅ datetime/date → ISO string
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        
        # ✅ UUID → string
        if isinstance(value, UUID):
            return str(value)
        
        # ✅ Types primitifs JSON-safe
        if isinstance(value, (str, int, float, bool)):
            return value
        
        # ✅ Listes
        if isinstance(value, list):
            return [AuditService._convert_value(item) for item in value]
        
        # ✅ Dictionnaires
        if isinstance(value, dict):
            return AuditService._make_json_safe(value)
        
        # ✅ Enum (pour les rôles, statuts, etc.)
        if hasattr(value, 'value'):
            return value.value
        
        # ✅ Fallback : conversion en string
        try:
            return str(value)
        except Exception:
            return None


# Instance globale du service
audit_service = AuditService()