from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class IncidentStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    solved = "solved"

class IncidentPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class IncidentCategory(str, enum.Enum):
    hardware = "hardware"
    software = "software"
    network = "network"
    security = "security"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=False)
    category = Column(SQLEnum(IncidentCategory, name="incident_category", native_enum=True), nullable=False)
    status = Column(
        SQLEnum(IncidentStatus, name="incident_status", native_enum=True),
        nullable=False,
        default=IncidentStatus.open.value  
    )
    priority = Column(
        SQLEnum(IncidentPriority, name="incident_priority", native_enum=True),
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resolver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id], backref="reported_incidents")
    resolver = relationship("User", foreign_keys=[resolver_id], backref="resolved_incidents")
