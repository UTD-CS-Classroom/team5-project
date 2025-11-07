from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import os
from uuid import uuid4
import models
import schemas
from database import get_db

router = APIRouter()

UPLOAD_DIR = "uploads"
MAX_TOTAL_SIZE_MB = 25

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{appointment_id}/files", response_model=List[schemas.File])
async def upload_files(
    appointment_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    existing_files = db.query(models.File).filter(models.File.appointment_id == appointment_id).all()
    existing_total_size = sum([f.size or 0 for f in existing_files])
    
    new_files_size = 0
    files_data = []
    for file in files:
        content = await file.read()
        files_data.append((file.filename, content))
        new_files_size += len(content)
    
    total_size_bytes = existing_total_size + new_files_size
    total_size_mb = total_size_bytes / (1024 * 1024)
    
    if total_size_mb > MAX_TOTAL_SIZE_MB:
        raise HTTPException(
            status_code=400, 
            detail=f"Total files size ({total_size_mb:.2f}MB) exceeds {MAX_TOTAL_SIZE_MB}MB limit"
        )

    saved_files = []
    for filename, content in files_data:
        unique_filename = f"{uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        db_file = models.File(
            appointment_id=appointment_id,
            file_path=file_path,
            size=len(content)
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        saved_files.append(db_file)

    return saved_files

