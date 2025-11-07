from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import schemas
import models

router = APIRouter(
    prefix="/public",
    tags=["Public"]
)

@router.get("/businesses", response_model=List[schemas.Business], summary="Search businesses")
def search_businesses(
    specialty: str = None,
    location: str = None,
    db: Session = Depends(get_db)
):
    """
    Search for businesses by specialty and/or location.
    
    - **specialty**: Optional filter by specialty (e.g., "Hair Salon", "Dental")
    - **location**: Optional filter by location (searches in address field)
    
    Returns a list of businesses matching the search criteria.
    If no filters provided, returns all businesses.
    """
    query = db.query(models.Business)
    
    if specialty:
        query = query.filter(models.Business.specialty.ilike(f"%{specialty}%"))
    
    if location:
        query = query.filter(models.Business.address.ilike(f"%{location}%"))
    
    businesses = query.all()
    return businesses

@router.get("/businesses/{business_id}", response_model=schemas.Business, summary="Get business details")
def get_business_detail(business_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific business.
    
    Returns business profile including name, specialty, description, and contact info.
    """
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.get("/businesses/{business_id}/timeslots", response_model=List[schemas.TimeSlot], summary="Get available time slots")
def get_business_available_slots(business_id: int, db: Session = Depends(get_db)):
    """
    Get all active time slots for a business.
    
    Returns only active time slots that customers can book.
    This helps customers see the business's availability before booking.
    """
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    timeslots = db.query(models.TimeSlot).filter(
        models.TimeSlot.business_id == business_id,
        models.TimeSlot.is_active == True
    ).all()
    return timeslots

@router.get("/businesses/{business_id}/slots", response_model=List[schemas.TimeSlot], summary="Get available time slots by date")
def get_business_slots_by_date(business_id: int, date: str = None, db: Session = Depends(get_db)):
    """
    Get available time slots for a business, optionally filtered by date.
    
    - **date**: Optional date filter in YYYY-MM-DD format
    
    Returns only active time slots that customers can book.
    """
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    timeslots = db.query(models.TimeSlot).filter(
        models.TimeSlot.business_id == business_id,
        models.TimeSlot.is_active == True
    ).all()
    
    # Note: For now returning all slots. In a production app, you would filter by:
    # 1. The day of week from the date parameter
    # 2. Check existing appointments to show only truly available slots
    return timeslots

@router.get("/businesses/{business_id}/services", response_model=List[schemas.Service], summary="Get business services")
def get_business_services_public(business_id: int, db: Session = Depends(get_db)):
    """
    Get all active services offered by a business.
    
    Returns only active services with pricing information.
    Customers can view services before booking an appointment.
    """
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    services = db.query(models.Service).filter(
        models.Service.business_id == business_id,
        models.Service.is_active == True
    ).all()
    return services

@router.get("/businesses/{business_id}/booked-slots", summary="Get booked time slots for a date")
def get_booked_slots(business_id: int, date: str, db: Session = Depends(get_db)):
    """
    Get all booked appointment times for a specific business and date.
    
    Returns a list of appointment times that are already booked.
    Frontend can use this to disable those time slots.
    """
    from datetime import datetime
    
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get all appointments for this business and date that are not cancelled
    appointments = db.query(models.Appointment).filter(
        models.Appointment.business_id == business_id,
        models.Appointment.appointment_date == target_date,
        models.Appointment.status != 'cancelled'
    ).all()
    
    # Return list of booked time slots (in HH:MM:SS format)
    booked_times = [apt.appointment_time.strftime('%H:%M:%S') if hasattr(apt.appointment_time, 'strftime') else str(apt.appointment_time) for apt in appointments]
    return {"booked_slots": booked_times}

