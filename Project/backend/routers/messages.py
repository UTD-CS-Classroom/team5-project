from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import schemas
import models
from auth import get_current_user

router = APIRouter(
    prefix="/appointments",
    tags=["Messages"]
)

@router.post("/{appointment_id}/messages", response_model=schemas.Message, summary="Send message")
def send_message(
    appointment_id: int,
    message_data: schemas.MessageCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in an appointment thread.
    
    Both customers and businesses can send messages for appointments they're part of.
    This enables communication before the appointment.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify user is part of this appointment
    if hasattr(current_user, 'user_type'):
        if current_user.user_type == 'customer' and appointment.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        elif current_user.user_type == 'business' and appointment.business_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        sender_type = current_user.user_type
        sender_id = current_user.id
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_message = models.Message(
        appointment_id=appointment_id,
        sender_type=sender_type,
        sender_id=sender_id,
        message=message_data.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/{appointment_id}/messages", response_model=List[schemas.Message], summary="Get appointment messages")
def get_messages(
    appointment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages for an appointment.
    
    Returns messages in chronological order.
    Both customers and businesses can view messages for appointments they're part of.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify user is part of this appointment
    if hasattr(current_user, 'user_type'):
        if current_user.user_type == 'customer' and appointment.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        elif current_user.user_type == 'business' and appointment.business_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(models.Message).filter(
        models.Message.appointment_id == appointment_id
    ).order_by(models.Message.created_at).all()
    return messages
