from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Incident, IncidentStatus
from app.utils.token import get_current_user


router = APIRouter(
    prefix="/stats",
    tags = ["Statistics"]
)

@router.get("/last-7-days")
def last_7_days_stats(current_user = Depends(get_current_user),db: Session = Depends(get_db)):
    
    today = datetime.utcnow().date()
    last_7_days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]


    stats = { 
        "dates": [d.isoformat() for d in last_7_days],
        "open":[0]*7,
        "in_progress": [0]*7,
        "solved" : [0]*7
    }

    query = db.query(
        func.date(Incident.created_at).label("date"),
        Incident.status,
        func.count(Incident.id)
    )
    if current_user.role == "admin_system":
        query = query 
    elif current_user.role.startswith("admin_"):
        sector_category = current_user.role.replace("admin_", "")
        query = query.filter(
            (Incident.resolver_id == current_user.id) |
            ((Incident.resolver_id.is_(None)) & (Incident.category == sector_category))
        )
    else:
        query = query.filter(Incident.reporter_id == current_user.id)

    query = query.filter(Incident.created_at >= last_7_days[0])
    query = query.group_by(func.date(Incident.created_at), Incident.status)
    
    results = query.all()

    # statistics
    for date_obj, status, count  in results:
        if date_obj in last_7_days:
            idx = last_7_days.index(date_obj)
            if status == IncidentStatus.open.value:
                stats["open"][idx] = count
            elif status == IncidentStatus.in_progress.value:
                stats["in_progress"][idx] = count
            elif status == IncidentStatus.solved.value:
                stats["solved"][idx] = count
    
    return stats


@router.get("/by-category")
def incidents_by_category(current_user = Depends(get_current_user), db:Session = Depends(get_db)):

    categories = [c.value for c in Incident.__table__.c.category.type.enum_class]
    stats = { c:0 for c in categories } #default 0

    query = db.query(Incident.category, func.count(Incident.id)).group_by(Incident.category)

    if current_user.role == "admin_system":
            pass
    elif not current_user.role.startswith("admin_"):
        query = query.filter(Incident.reporter_id == current_user.id)
    else:
        return{"message": "No category stats for sector admin"}
    
    results =  query.all()

    for category, count in results:
        stats[category.value] = count

    return stats


@router.get("/status-distirubtion")
def status_distribution( current_user = Depends(get_current_user), db:Session = Depends(get_db)):
    
    query  = db.query(Incident.status, func.count(Incident.id))

    if current_user.role == "admin_system":
        pass
    elif current_user.role.startswith("admin_"):
        sector_category = current_user.role.replace("admin_", "")
        query = query.filter(
            (Incident.resolver_id == current_user.id) |
            ((Incident.resolver_id.is_(None)) & (Incident.category == sector_category))
        )
    else:
        query = query.filter(Incident.reporter_id == current_user.id)

    query = query.group_by(Incident.status)
    results = query.all()

    stats = {status.value: 0 for status in IncidentStatus}
    for status, count in results:
        stats[status.value] = count
    
    return stats


@router.get("/last-3-months")
def last_3_months(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=90)  # 3 months

    # Base query
    query = db.query(Incident.status, func.count(Incident.id))

    # role filteR
    if current_user.role == "admin_system":
        pass
    elif current_user.role.startswith("admin_"):
        sector_category = current_user.role.replace("admin_", "")
        query = query.filter(
            (Incident.resolver_id == current_user.id) |
            ((Incident.resolver_id.is_(None)) & (Incident.category == sector_category))
        )
    else:
        query = query.filter(Incident.reporter_id == current_user.id)

    query = query.filter(Incident.created_at >= start_date)
    query = query.group_by(Incident.status)
    results = query.all()

    # Initializing
    stats = {status.value: 0 for status in IncidentStatus}

    for status, count in results:
        stats[status.value] = count

    return stats