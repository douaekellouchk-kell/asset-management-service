from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime
import enum

class ReturnCondition(str, enum.Enum):
    GOOD = "GOOD"
    DAMAGED = "DAMAGED"
    LOST = "LOST"

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    employee_id = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    returned_at = Column(DateTime, nullable=True)
    return_condition = Column(SQLEnum(ReturnCondition, name="return_condition"), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relations - Utiliser des strings pour éviter les problèmes d'import
    asset = relationship("Asset", back_populates="assignments")
    employee = relationship("User", back_populates="assignments", foreign_keys=[employee_id])
    manager = relationship("User", back_populates="managed_assignments", foreign_keys=[assigned_by])