from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional

# ENUMS

class IncidentStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    solved = "solved"


class IncidentPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class IncidentCategory(str, Enum):
    hardware = "hardware"
    software = "software"
    network = "network"
    security = "security"

# CREATE SCHEMA


class IncidentCreate(BaseModel):
    title: str = Field(
        ..., 
        min_length=1,
        max_length=255,
        description="Titulli i incidentit",
        example="Printeri nuk punon"
    )
    description: str = Field(
        ..., 
        description="Përshkrimi i plotë i incidentit", 
        example="Printeri në katin e dytë nuk funksionon."
    )
    category: IncidentCategory = Field(
        ..., 
        description="Kategoria e incidentit", 
        example="hardware"
    )
    priority: IncidentPriority = Field(
        ..., 
        description="Prioriteti i incidentit", 
        example="high"
    )
    reporter_id: int = Field(
        ..., 
        description="ID e përdoruesit që ka raportuar incidentin", 
        example=1
    )

# READ SCHEMA

class IncidentRead(BaseModel):
    id: int
    title: str
    description: str
    category: IncidentCategory
    status: IncidentStatus
    priority: IncidentPriority
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reporter_id: int
    resolver_id: Optional[int] = None

    class Config:
        from_attributes = True  

# UPDATE SCHEMA


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Titulli i ri i incidentit", example="Probleme me internetin")
    description: Optional[str] = Field(None, description="Përshkrimi i përditësuar", example="Internet i ngadalshëm në zyren A3")
    category: Optional[IncidentCategory] = Field(None, description="Kategoria e përditësuar", example="network")
    status: Optional[IncidentStatus] = Field(None, description="Statusi i ri", example="in_progress")
    priority: Optional[IncidentPriority] = Field(None, description="Prioriteti i ri", example="critical")
    resolver_id: Optional[int] = Field(None, description="ID e personit që po e zgjidh", example=3)
