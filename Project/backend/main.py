from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import engine
import models
from routers import auth, customer, business, public, messages, upload

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Appointment Booking System",
    description="""
    A comprehensive appointment booking system with dual portal access for customers and businesses.
    
    ## Features
    
    * **Customer Portal**: Book, reschedule, and cancel appointments
    * **Business Portal**: Manage appointments, availability, and time slots
    * **Authentication**: Secure JWT-based authentication
    * **Messaging**: Communication between customers and businesses
    * **Search**: Find businesses by specialty and location
    
    ## Authentication
    
    Most endpoints require authentication. To authenticate:
    1. Register or login to get an access token
    2. Click the "Authorize" button (🔒) at the top
    3. Enter: `Bearer YOUR_ACCESS_TOKEN`
    4. Click "Authorize"
    
    ## User Types
    
    - **Customer**: Can book and manage appointments
    - **Business**: Can manage availability and appointment requests
    """,
    version="1.0.0",
    contact={
        "name": "Team 5",
        "email": "support@appointmentbooking.com",
    },
    license_info={
        "name": "MIT",
    }
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(customer.router)
app.include_router(business.router)
app.include_router(public.router)
app.include_router(messages.router)
app.include_router(upload.router)

@app.get("/", tags=["Root"])
def root():
    """
    Welcome endpoint - provides API information.
    """
    return {
        "message": "Appointment Booking System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Root"])
def health_check():
    """
    Health check endpoint - useful for monitoring.
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
