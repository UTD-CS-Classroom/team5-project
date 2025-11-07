from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date, Time, Text, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Customer(Base):
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    appointments = relationship('Appointment', back_populates='customer')

class Business(Base):
    __tablename__ = 'businesses'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    business_name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    specialty = Column(String)  # e.g., "Hair Salon", "Dental", "Legal"
    description = Column(Text)
    profile_image = Column(String)  # Path to profile image file
    cover_image = Column(String)   # Path to cover/backdrop image file
    created_at = Column(DateTime, default=datetime.utcnow)
    
    appointments = relationship('Appointment', back_populates='business')
    time_slots = relationship('TimeSlot', back_populates='business', cascade='all, delete-orphan')
    services = relationship('Service', back_populates='business', cascade='all, delete-orphan')

class Service(Base):
    __tablename__ = 'services'
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    business = relationship('Business', back_populates='services')

class TimeSlot(Base):
    __tablename__ = 'time_slots'
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_duration_minutes = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    
    business = relationship('Business', back_populates='time_slots')

class Appointment(Base):
    __tablename__ = 'appointments'
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(String, unique=True, nullable=False, index=True)  # Unique ID for tracking
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=30)
    status = Column(String, default='pending')  # pending, confirmed, completed, cancelled, rejected, no_show
    business_note = Column(Text)  # Note from business when approving/rejecting
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship('Customer', back_populates='appointments')
    business = relationship('Business', back_populates='appointments')
    messages = relationship('Message', back_populates='appointment', cascade='all, delete-orphan')

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=False)
    sender_type = Column(String, nullable=False)  # 'customer' or 'business'
    sender_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    appointment = relationship('Appointment', back_populates='messages')
