from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Business)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    business_data = business.model_dump()
    # Convert HttpUrl to string if present
    if business_data.get('portfolio_url'):
        business_data['portfolio_url'] = str(business_data['portfolio_url'])
    db_business = models.Business(**business_data)
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

@router.get("/", response_model=List[schemas.Business])
def list_businesses(db: Session = Depends(get_db)):
    return db.query(models.Business).all()

@router.get("/{business_id}", response_model=schemas.Business)
def get_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@router.put("/{business_id}", response_model=schemas.Business)
def update_business(business_id: int, updated: schemas.BusinessCreate, db: Session = Depends(get_db)):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    updated_data = updated.model_dump()
    # Convert HttpUrl to string if present
    if updated_data.get('portfolio_url'):
        updated_data['portfolio_url'] = str(updated_data['portfolio_url'])
    for key, value in updated_data.items():
        setattr(business, key, value)
    db.commit()
    db.refresh(business)
    return business

@router.delete("/{business_id}")
def delete_business(business_id: int, db: Session = Depends(get_db)):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    db.delete(business)
    db.commit()
    return {"detail": "Business deleted"}

