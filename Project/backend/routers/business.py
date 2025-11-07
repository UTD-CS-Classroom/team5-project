from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import schemas
import models
from auth import get_current_business

router = APIRouter(
    prefix="/business",
    tags=["Business Portal"],
    dependencies=[Depends(get_current_business)]
)

@router.get("/me", response_model=schemas.Business, summary="Get business profile")
def get_business_profile(current_business: models.Business = Depends(get_current_business)):
    """
    Get the current logged-in business's profile information.
    
    Requires authentication token.
    """
    return current_business

@router.put("/me", response_model=schemas.Business, summary="Update business profile")
def update_business_profile(
    business_update: schemas.BusinessBase,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Update the business profile information.
    
    All fields can be updated except email (which is used for authentication).
    """
    current_business.business_name = business_update.business_name
    current_business.phone = business_update.phone
    current_business.address = business_update.address
    current_business.specialty = business_update.specialty
    current_business.description = business_update.description
    db.commit()
    db.refresh(current_business)
    return current_business

@router.get("/appointments", response_model=List[schemas.AppointmentDetail], summary="Get business appointments")
def get_business_appointments(
    status: str = None,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Get all appointments for the current business.
    
    - **status**: Optional filter by status (pending, confirmed, completed, cancelled, rejected, no_show)
    
    Returns a list of appointments with full customer details.
    """
    query = db.query(models.Appointment).filter(
        models.Appointment.business_id == current_business.id
    )
    
    if status:
        query = query.filter(models.Appointment.status == status)
    
    appointments = query.all()
    return appointments

@router.put("/appointments/{appointment_id}/status", response_model=schemas.Appointment, summary="Update appointment status")
@router.patch("/appointments/{appointment_id}/status", response_model=schemas.Appointment, summary="Update appointment status")
def update_appointment_status(
    appointment_id: int,
    update: schemas.AppointmentUpdate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Update the status of an appointment and optionally add a note.
    
    - **status**: New status (pending, confirmed, completed, cancelled, rejected, no_show)
    - **business_note**: Optional note from business (e.g., reason for rejection)
    
    This allows businesses to approve/reject bookings and mark appointments as completed or no-show.
    """
    appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.business_id == current_business.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    valid_statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'no_show']
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    appointment.status = update.status
    if update.business_note:
        appointment.business_note = update.business_note
    
    db.commit()
    db.refresh(appointment)
    return appointment

@router.post("/timeslots", response_model=schemas.TimeSlot, summary="Create time slot")
def create_time_slot(
    timeslot: schemas.TimeSlotCreate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Create a new availability time slot.
    
    - **day_of_week**: Day of week (0=Monday, 6=Sunday)
    - **start_time**: Start time (HH:MM:SS format)
    - **end_time**: End time (HH:MM:SS format)
    - **slot_duration_minutes**: Duration of each slot in minutes (default: 30)
    - **is_active**: Whether this slot is active (default: true)
    
    This sets your availability for the specified day and time range.
    """
    db_timeslot = models.TimeSlot(
        business_id=current_business.id,
        **timeslot.dict()
    )
    db.add(db_timeslot)
    db.commit()
    db.refresh(db_timeslot)
    return db_timeslot

@router.get("/timeslots", response_model=List[schemas.TimeSlot], summary="Get business time slots")
def get_business_time_slots(
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Get all time slots for the current business.
    
    Returns all availability slots (both active and inactive).
    """
    timeslots = db.query(models.TimeSlot).filter(
        models.TimeSlot.business_id == current_business.id
    ).all()
    return timeslots

@router.delete("/timeslots/{timeslot_id}", summary="Delete time slot")
def delete_time_slot(
    timeslot_id: int,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Delete a time slot.
    
    This removes the availability slot completely.
    """
    timeslot = db.query(models.TimeSlot).filter(
        models.TimeSlot.id == timeslot_id,
        models.TimeSlot.business_id == current_business.id
    ).first()
    
    if not timeslot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    db.delete(timeslot)
    db.commit()
    return {"message": "Time slot deleted successfully"}

# ==================== Service Routes ====================

@router.post("/services", response_model=schemas.Service, summary="Create service")
def create_service(
    service: schemas.ServiceCreate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Create a new service offering.
    
    - **name**: Service name (e.g., "Haircut", "Teeth Cleaning")
    - **description**: Optional detailed description
    - **price**: Service price (must be greater than 0)
    - **duration_minutes**: Service duration in minutes (default: 30)
    - **is_active**: Whether this service is active (default: true)
    
    This allows businesses to list their services with pricing.
    """
    db_service = models.Service(
        business_id=current_business.id,
        **service.dict()
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/services", response_model=List[schemas.Service], summary="Get business services")
def get_business_services(
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Get all services for the current business.
    
    Returns all services (both active and inactive).
    """
    services = db.query(models.Service).filter(
        models.Service.business_id == current_business.id
    ).all()
    return services

@router.get("/services/{service_id}", response_model=schemas.Service, summary="Get service details")
def get_service(
    service_id: int,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific service.
    """
    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.business_id == current_business.id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service

@router.put("/services/{service_id}", response_model=schemas.Service, summary="Update service")
def update_service(
    service_id: int,
    service_update: schemas.ServiceUpdate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Update an existing service.
    
    All fields are optional. Only provided fields will be updated.
    """
    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.business_id == current_business.id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    return service

@router.delete("/services/{service_id}", summary="Delete service")
def delete_service(
    service_id: int,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Delete a service.
    
    This removes the service completely.
    """
    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.business_id == current_business.id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}

@router.put("/profile", response_model=schemas.Business, summary="Update business profile")
def update_business_profile(
    profile_update: schemas.BusinessUpdate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Update the current business's profile information.
    """
    if profile_update.name is not None:
        current_business.name = profile_update.name
    if profile_update.email is not None:
        # Check if email already exists
        existing = db.query(models.Business).filter(
            models.Business.email == profile_update.email,
            models.Business.id != current_business.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_business.email = profile_update.email
    if profile_update.phone is not None:
        current_business.phone = profile_update.phone
    if profile_update.address is not None:
        current_business.address = profile_update.address
    if profile_update.description is not None:
        current_business.description = profile_update.description
    if profile_update.category is not None:
        current_business.category = profile_update.category
    
    db.commit()
    db.refresh(current_business)
    return current_business

@router.get("/timeslots", response_model=List[schemas.TimeSlot], summary="Get business time slots")
def get_business_timeslots(
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Get all time slots for the current business.
    """
    timeslots = db.query(models.TimeSlot).filter(
        models.TimeSlot.business_id == current_business.id
    ).all()
    return timeslots

@router.post("/timeslots", response_model=schemas.TimeSlot, summary="Create time slot")
def create_timeslot(
    timeslot: schemas.TimeSlotCreate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Create a new time slot for the business.
    """
    db_timeslot = models.TimeSlot(
        business_id=current_business.id,
        **timeslot.dict()
    )
    db.add(db_timeslot)
    db.commit()
    db.refresh(db_timeslot)
    return db_timeslot

@router.put("/timeslots/{timeslot_id}", response_model=schemas.TimeSlot, summary="Update time slot")
def update_timeslot(
    timeslot_id: int,
    timeslot_update: schemas.TimeSlotUpdate,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Update an existing time slot.
    """
    timeslot = db.query(models.TimeSlot).filter(
        models.TimeSlot.id == timeslot_id,
        models.TimeSlot.business_id == current_business.id
    ).first()
    
    if not timeslot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    update_data = timeslot_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(timeslot, field, value)
    
    db.commit()
    db.refresh(timeslot)
    return timeslot

@router.delete("/timeslots/{timeslot_id}", summary="Delete time slot")
def delete_timeslot(
    timeslot_id: int,
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Delete a time slot.
    """
    timeslot = db.query(models.TimeSlot).filter(
        models.TimeSlot.id == timeslot_id,
        models.TimeSlot.business_id == current_business.id
    ).first()
    
    if not timeslot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    db.delete(timeslot)
    db.commit()
    return {"message": "Time slot deleted successfully"}

@router.delete("/account", summary="Delete business account")
def delete_business_account(
    current_business: models.Business = Depends(get_current_business),
    db: Session = Depends(get_db)
):
    """
    Delete the current business's account and all associated data.
    """
    # Delete all appointments
    db.query(models.Appointment).filter(
        models.Appointment.business_id == current_business.id
    ).delete()
    
    # Delete all time slots
    db.query(models.TimeSlot).filter(
        models.TimeSlot.business_id == current_business.id
    ).delete()
    
    # Delete all services
    db.query(models.Service).filter(
        models.Service.business_id == current_business.id
    ).delete()
    
    # Delete the business
    db.delete(current_business)
    db.commit()
    return {"message": "Account deleted successfully"}

