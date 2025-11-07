from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Message)
def create_message(appointment_id: int, message: schemas.MessageCreate, db: Session = Depends(get_db)):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db_message = models.Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=List[schemas.Message])
def get_messages(appointment_id: int, db: Session = Depends(get_db)):
    return db.query(models.Message).filter(models.Message.appointment_id == appointment_id).all()

