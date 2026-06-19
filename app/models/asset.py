from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime
import enum

class AssetStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    DAMAGED = "DAMAGED"
    MAINTENANCE = "MAINTENANCE"
    RETIRED = "RETIRED"

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    serial_number = Column(String(100), unique=True, nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    status = Column(SQLEnum(AssetStatus, name="asset_status"), nullable=False, default=AssetStatus.AVAILABLE)
    purchase_date = Column(DateTime, nullable=True)
    purchase_value = Column(DECIMAL(12, 2), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relations
    category = relationship("Category", back_populates="assets")
    assignments = relationship("Assignment", back_populates="asset")