from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List,Optional
from app import database, models
from app.schemas.incident import IncidentCreate,IncidentRead, IncidentUpdate,IncidentStatus
from sqlalchemy import case,or_
from app.routers.auth import get_current_user
from app.utils.logger import info, debug, warning, exception, logger
from fastapi.encoders import jsonable_encoder
from datetime import datetime

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)

get_db = database.get_db

# Dependency to extract request_id from headers
def get_request_id(request: Request):
    return request.headers.get("X-Request-ID", "N/A")

@router.post("/", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident: IncidentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] User email={current_user.email}, id={current_user.id} creating incident: title={incident.title}, category={incident.category}, priority={incident.priority}")
    logger.debug(f"[RequestID={request_id}] Full incident input: {incident.dict()}")
    try:
        db_incident = models.Incident(**incident.dict())
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)

        # 🔹 Konverto në JSON me datat UTC
        incident_data = jsonable_encoder(db_incident)
        print("Incident UTC:", incident_data["created_at"])

        logger.info(f"[RequestID={request_id}] Incident created successfully with ID:{db_incident.id} by user ID={current_user.id}")
        return db_incident
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error creating incident by user ID={current_user.id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create incident")


@router.get("/", response_model=List[IncidentRead])
def get_incidents(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    status: Optional[List[str]] = Query(None),
    priority: Optional[List[str]] = Query(None),
    search: Optional[str] = None,
    order_by: Optional[str] = None,
    date: Optional[datetime] = Query(None, description="Show  incidents from this date onwards")
):
    query = db.query(models.Incident)

    # 🔹 Filtrimi sipas status
    if status:
        query = query.filter(models.Incident.status.in_(status))

    # 🔹 Filtrimi sipas priority
    if priority:
        query = query.filter(models.Incident.priority.in_(priority))

    # 🔹 Search (opsional)
    if search:
        query = query.filter(
            models.Incident.title.ilike(f"%{search}%")
            | models.Incident.description.ilike(f"%{search}%")
        )
    
    if date:
        query = query.filter(models.Incident.created_at >= date)

    # 🔹 Renditja sipas priority
    priority_order = case(
        (models.Incident.priority == "low", 1),
        (models.Incident.priority == "medium", 2),
        (models.Incident.priority == "high", 3),
        else_=4
    )

    # 🔹 Renditja sipas status
    status_order = case(
        (models.Incident.status == "open", 1),
        (models.Incident.status == "in_progress", 2),
        (models.Incident.status == "solved", 3),
        (models.Incident.status == "archived", 4),
        else_=5
    )

    if order_by == "priority":
        query = query.order_by(priority_order.asc())
    elif order_by == "status":
        query = query.order_by(status_order.asc())
    else:
        query = query.order_by(models.Incident.created_at.desc())

    return query.all()

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id)
):
    logger.info(f"[RequestID={request_id}] User email={current_user.email}, id={current_user.id} attempting to delete incident with ID: {incident_id}")
    try:
        incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
        if not incident:
            logger.warning(f"[RequestID={request_id}] Incident not found with ID: {incident_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        db.delete(incident)
        db.commit()
        logger.info(f"[RequestID={request_id}] Deleted incident successfully with ID: {incident_id} by user ID={current_user.id}")
        return None
    except Exception:
        logger.exception(f"[RequestID={request_id}] Error deleting incident with ID: {incident_id} by user ID={current_user.id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error deleting incident")


@router.get("/search", response_model=List[IncidentRead], status_code=status.HTTP_200_OK)
def search_incidents(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, gt=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        incidents = (
            db.query(models.Incident)
            .filter(
                models.Incident.title.ilike(f"%{q}%"),
                models.Incident.description.ilike(f"%{q}%") | models.Incident.title.ilike(f"%{q}%")
            )
            .order_by(models.Incident.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return incidents
    except Exception:
        logger.exception(f"[RequestID=N/A] Error searching incidents")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error searching incidents")

ALLOWED_STATUSES = [status.value for status in IncidentStatus]

@router.patch("/{incident_id}/status", response_model=IncidentRead)
def update_incident_status(
    incident_id: int,
    new_status: IncidentStatus = Query(..., description="New status for the incident"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request_id: str = Depends(get_request_id)
):
    if not current_user.role.startswith("admin_"):
        raise HTTPException(status_code=403, detail="Only sector admins can change incident status")

    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # if solved set resolver_id
    if new_status == IncidentStatus.solved:
        incident.resolver_id = current_user.id

    # Update statusin
    incident.status = new_status.value

    try:
        db.commit()
        db.refresh(incident)
        logger.info(f"[RequestID={request_id}] Incident {incident_id} status updated to {new_status.value} by user {current_user.id}")
        return incident
    except Exception as e:
        db.rollback()
        logger.exception(f"[RequestID={request_id}] Failed to update incident status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update incident status")

