from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True)
    action = Column(String, index=True)  # CREATE, UPDATE, DELETE, ASSIGN, RETURN
    entity_type = Column(String, index=True)  # "asset", "user", "category"
    entity_id = Column(String, index=True)  # ID de l'entité concernée
    user_id = Column(String, ForeignKey("users.id"), index=True)
    user_email = Column(String, index=True)
    description = Column(String)
    changes = Column(JSON)  # Diff avant/après (optionnel mais valorisant)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationship
    user = relationship("User", back_populates="audit_logs")