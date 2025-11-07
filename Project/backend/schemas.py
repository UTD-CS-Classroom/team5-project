from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date, time
from typing import Optional, List

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None

# Customer Schemas
class CustomerBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    password: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class Customer(CustomerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

# Business Schemas
class BusinessBase(BaseModel):
    email: EmailStr
    business_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    specialty: Optional[str] = None
    description: Optional[str] = None

class BusinessCreate(BusinessBase):
    password: str

class BusinessLogin(BaseModel):
    email: EmailStr
    password: str

class Business(BusinessBase):
    id: int
    created_at: datetime
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    
    class Config:
        from_attributes = True

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

# TimeSlot Schemas
class TimeSlotBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time
    slot_duration_minutes: int = 30
    is_active: bool = True

class TimeSlotCreate(TimeSlotBase):
    pass

class TimeSlotUpdate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class TimeSlot(TimeSlotBase):
    id: int
    business_id: int
    
    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    duration_minutes: int = Field(default=30, gt=0)
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    duration_minutes: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

class Service(ServiceBase):
    id: int
    business_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    appointment_date: date
    appointment_time: time
    duration_minutes: int = 30

class AppointmentCreate(AppointmentBase):
    business_id: int

class AppointmentUpdate(BaseModel):
    status: str
    business_note: Optional[str] = None

class AppointmentReschedule(BaseModel):
    appointment_date: date
    appointment_time: time

class Appointment(AppointmentBase):
    id: int
    appointment_id: str
    customer_id: int
    business_id: int
    status: str
    business_note: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class AppointmentDetail(Appointment):
    customer: Customer
    business: Business

# Message Schemas
class MessageCreate(BaseModel):
    message: str

class Message(BaseModel):
    id: int
    appointment_id: int
    sender_type: str
    sender_id: int
    message: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Search Schema
class BusinessSearch(BaseModel):
    specialty: Optional[str] = None
    location: Optional[str] = None
