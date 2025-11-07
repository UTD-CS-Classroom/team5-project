# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, EmailStr, HttpUrl, StringConstraints
from typing import Optional, List, Annotated

# Business Schemas
class BusinessBase(BaseModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=100)]
    specialty: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    portfolio_url: Optional[HttpUrl] = None

class BusinessCreate(BusinessBase):
    pass

class Business(BusinessBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# File Schemas
class File(BaseModel):
    id: int
    appointment_id: int
    file_path: str
    size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    business_id: int
    customer_name: Annotated[str, StringConstraints(min_length=2, max_length=100)]
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    date_time: datetime
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    files: List[File] = []

    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    appointment_id: int
    sender: Annotated[str, StringConstraints(pattern="^(customer|business)$")]
    text: Annotated[str, StringConstraints(min_length=1, max_length=1000)]

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
