from app.database import engine, Base
from app.models import user, incident

Base.metadata.create_all(bind=engine)

print("Successful!")