# app/main.py
"""FastAPI Application - AppointmentsOnTheGo Backend."""

from fastapi import FastAPI
from database import Base, engine
from routes import businesses, appointments, messages, files

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AppointmentsOnTheGo",
    version="1.0.0",
    description="Backend API for managing business appointments"
)

app.include_router(businesses.router, prefix="/businesses", tags=["Businesses"])
app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
app.include_router(messages.router, prefix="/appointments/{appointment_id}/messages", tags=["Messages"])
app.include_router(files.router, prefix="/appointments", tags=["Files"])

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "AppointmentsOnTheGo API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }
