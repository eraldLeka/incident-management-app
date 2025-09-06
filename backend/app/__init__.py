from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.incident import router as incident_router
from app.routers.userTable import router as users_router
from app import models, database


models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(users_router)

