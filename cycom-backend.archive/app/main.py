from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routers import sign, users, auth
from app.db.session import engine, Base
from app.models import sign as sign_models
from app.models import user as user_models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cycom ERP Backend",
    description="Python/FastAPI backend for Cycom ERP",
    version="1.0.0",
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(sign.router, prefix="/api/sign", tags=["eSign"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Cycom ERP API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

