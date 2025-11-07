from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import secrets
import string

from database import get_db
import schemas
import models
from auth import get_current_customer

router = APIRouter(
    prefix="/customer",
    tags=["Customer Portal"],
    dependencies=[Depends(get_current_customer)]
)

def generate_appointment_id():
    """Generate a unique 8-character appointment ID"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(8))

@router.get("/me", response_model=schemas.Customer, summary="Get customer profile")
def get_customer_profile(current_customer: models.Customer = Depends(get_current_customer)):
    """
    Get the current logged-in customer's profile information.
    
    Requires authentication token.
    """
    return current_customer

@router.get("/appointments", response_model=List[schemas.AppointmentDetail], summary="Get customer appointments")
def get_customer_appointments(
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Get all appointments for the current customer.
    
    Returns a list of appointments with full business details.
    """
    appointments = db.query(models.Appointment).filter(
        models.Appointment.customer_id == current_customer.id
    ).all()
    return appointments

@router.post("/appointments", response_model=schemas.Appointment, summary="Create new appointment")
def create_appointment(
    appointment: schemas.AppointmentCreate,
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment booking.
    
    - **business_id**: ID of the business to book with
    - **appointment_date**: Date of the appointment
    - **appointment_time**: Time of the appointment
    - **duration_minutes**: Duration in minutes (default: 30)
    
    Returns the created appointment with a unique appointment ID.
    """
    # Check if business exists
    business = db.query(models.Business).filter(models.Business.id == appointment.business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Generate unique appointment ID
    appointment_id = generate_appointment_id()
    while db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first():
        appointment_id = generate_appointment_id()
    
    db_appointment = models.Appointment(
        appointment_id=appointment_id,
        customer_id=current_customer.id,
        business_id=appointment.business_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        duration_minutes=appointment.duration_minutes,
        status='confirmed'  # Auto-confirm appointments, business can cancel if needed
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.put("/appointments/{appointment_id}/reschedule", response_model=schemas.Appointment, summary="Reschedule appointment")
def reschedule_appointment(
    appointment_id: int,
    reschedule_data: schemas.AppointmentReschedule,
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Reschedule an existing appointment.
    
    - **appointment_date**: New date for the appointment
    - **appointment_time**: New time for the appointment
    
    The appointment status will be reset to 'pending' after rescheduling.
    """
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.customer_id == current_customer.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.status in ['completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Cannot reschedule completed or cancelled appointment")
    
    appointment.appointment_date = reschedule_data.appointment_date
    appointment.appointment_time = reschedule_data.appointment_time
    appointment.status = 'pending'
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/appointments/{appointment_id}", summary="Cancel appointment")
def cancel_appointment(
    appointment_id: int,
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Cancel an appointment.
    
    Sets the appointment status to 'cancelled'.
    """
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.customer_id == current_customer.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = 'cancelled'
    db.commit()
    return {"message": "Appointment cancelled successfully"}

@router.put("/profile", response_model=schemas.Customer, summary="Update customer profile")
def update_customer_profile(
    profile_update: schemas.CustomerUpdate,
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Update the current customer's profile information.
    """
    if profile_update.name is not None:
        current_customer.name = profile_update.name
    if profile_update.email is not None:
        # Check if email already exists
        existing = db.query(models.Customer).filter(
            models.Customer.email == profile_update.email,
            models.Customer.id != current_customer.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_customer.email = profile_update.email
    if profile_update.phone is not None:
        current_customer.phone = profile_update.phone
    
    db.commit()
    db.refresh(current_customer)
    return current_customer

@router.delete("/account", summary="Delete customer account")
def delete_customer_account(
    current_customer: models.Customer = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Delete the current customer's account and all associated data.
    """
    # Delete all appointments first
    db.query(models.Appointment).filter(
        models.Appointment.customer_id == current_customer.id
    ).delete()
    
    # Delete the customer
    db.delete(current_customer)
    db.commit()
    return {"message": "Account deleted successfully"}
