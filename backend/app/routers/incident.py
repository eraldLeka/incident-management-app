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
from app.models import IncidentCategory


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

        # 🔹 converting JSON datat UTC
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
    category: Optional[List[str]] = Query(None, description="Filter by categories"),
    startDate: Optional[str] = Query(None, description="Filter incidents from this date YYYY-MM-DD"),
    search: Optional[str] = None,
    sortBy: Optional[str] = Query("created_at", description="Sort by: created_at, priority, status"),
    sortOrder: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of incidents per page")
):
    query = db.query(models.Incident)

    # status filter
    if status:
        status_enums = [models.IncidentStatus(s) for s in status]
        query = query.filter(models.Incident.status.in_(status_enums))

    #  priority filter
    if priority:
        priority_enums = [models.IncidentPriority(p) for p in priority]
        query = query.filter(models.Incident.priority.in_(priority_enums))

    #category filter
    if category:
        category_enums = [models.IncidentCategory(c) for c in category]
        query = query.filter(models.Incident.category.in_(category_enums))

    # role
    if current_user.role == "admin_system":
        query = query  
    elif current_user.role.startswith("admin_"):
        sector_category = current_user.role.replace("admin_", "")
        query = query.filter(
            (models.Incident.resolver_id == current_user.id) |
            ((models.Incident.resolver_id.is_(None)) & (models.Incident.category == sector_category))
        )
    else:
        query = query.filter(models.Incident.reporter_id == current_user.id)

    # date filter
    if startDate:
        try:
            date_obj = datetime.strptime(startDate, "%Y-%m-%d")
            query_on_date = query.filter(
                models.Incident.created_at >= datetime.combine(date_obj, datetime.min.time()),
                models.Incident.created_at <= datetime.combine(date_obj, datetime.max.time())
            )
            incidents_on_date = query_on_date.all()
            if incidents_on_date:
                query = query_on_date
            else:
                query = query.filter(models.Incident.created_at >= datetime.combine(date_obj, datetime.min.time()))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Search
    if search:
        query = query.filter(
            or_(
                models.Incident.title.ilike(f"%{search}%"),
                models.Incident.description.ilike(f"%{search}%")
            )
        )

    # Sort
    priority_order = case(
        (models.Incident.priority == models.IncidentPriority.low, 1),
        (models.Incident.priority == models.IncidentPriority.medium, 2),
        (models.Incident.priority == models.IncidentPriority.high, 3),
        (models.Incident.priority == models.IncidentPriority.critical, 4),
        else_=5
    )
    status_order = case(
        (models.Incident.status == models.IncidentStatus.open, 1),
        (models.Incident.status == models.IncidentStatus.in_progress, 2),
        (models.Incident.status == models.IncidentStatus.solved, 3),
        else_=4
    )

    order_func = lambda col: col.asc() if sortOrder == "asc" else col.desc()

    if sortBy == "priority":
        query = query.order_by(order_func(priority_order))
    elif sortBy == "status":
        query = query.order_by(order_func(status_order))
    else:
        query = query.order_by(order_func(models.Incident.created_at))

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

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

