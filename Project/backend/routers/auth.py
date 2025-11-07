from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
import schemas
import models
from auth import (
    authenticate_customer,
    authenticate_business,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/customer/register", response_model=schemas.Customer, summary="Register a new customer")
def register_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """
    Register a new customer account.
    
    - **email**: Valid email address (must be unique)
    - **password**: Password for the account
    - **full_name**: Customer's full name
    - **phone**: Optional phone number
    """
    db_customer = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if db_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(customer.password)
    db_customer = models.Customer(
        email=customer.email,
        hashed_password=hashed_password,
        full_name=customer.full_name,
        phone=customer.phone
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.post("/customer/login", response_model=schemas.Token, summary="Customer login")
def login_customer(customer: schemas.CustomerLogin, db: Session = Depends(get_db)):
    """
    Authenticate a customer and receive an access token.
    
    Returns a JWT token that should be included in the Authorization header
    for subsequent requests as: Bearer {token}
    """
    user = authenticate_customer(db, customer.email, customer.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "type": "customer"},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "customer",
        "user_id": user.id
    }

@router.post("/business/register", response_model=schemas.Business, summary="Register a new business")
def register_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    """
    Register a new business account.
    
    - **email**: Valid email address (must be unique)
    - **password**: Password for the account
    - **business_name**: Name of the business
    - **phone**: Optional phone number
    - **address**: Optional business address
    - **specialty**: Optional specialty (e.g., "Hair Salon", "Dental")
    - **description**: Optional business description
    """
    db_business = db.query(models.Business).filter(models.Business.email == business.email).first()
    if db_business:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(business.password)
    db_business = models.Business(
        email=business.email,
        hashed_password=hashed_password,
        business_name=business.business_name,
        phone=business.phone,
        address=business.address,
        specialty=business.specialty,
        description=business.description
    )
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

@router.post("/business/login", response_model=schemas.Token, summary="Business login")
def login_business(business: schemas.BusinessLogin, db: Session = Depends(get_db)):
    """
    Authenticate a business and receive an access token.
    
    Returns a JWT token that should be included in the Authorization header
    for subsequent requests as: Bearer {token}
    """
    user = authenticate_business(db, business.email, business.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "type": "business"},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "business",
        "user_id": user.id
    }
