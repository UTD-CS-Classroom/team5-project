from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
import mimetypes

from database import get_db
from models import Business
from auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Maximum file size: 25 MB
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB in bytes

# Allowed file types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
}
ALLOWED_VIDEO_TYPES = {
    "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"
}
ALLOWED_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES


def validate_file(file: UploadFile) -> tuple[bool, str]:
    """Validate file type and size"""
    # Check file type
    content_type = file.content_type
    if content_type not in ALLOWED_TYPES:
        return False, f"File type {content_type} not allowed. Allowed types: images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, QuickTime, AVI)"
    
    return True, ""


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()


@router.post("/business/profile-image")
async def upload_business_profile_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile image for business"""
    if not hasattr(current_user, 'user_type') or current_user.user_type != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only businesses can upload business profile images"
        )
    
    # Validate file
    is_valid, error_msg = validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is 25 MB. Your file is {file_size / (1024*1024):.2f} MB"
        )
    
    # current_user is the Business object
    business = current_user
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Delete old profile image if exists
    if business.profile_image:
        old_file_path = UPLOAD_DIR / business.profile_image
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    unique_filename = f"business_{business.id}_profile_{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update business record
    business.profile_image = unique_filename
    db.commit()
    
    return {
        "message": "Profile image uploaded successfully",
        "filename": unique_filename,
        "url": f"/upload/files/{unique_filename}"
    }


@router.post("/business/cover-image")
async def upload_business_cover_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload cover/backdrop image for business"""
    if not hasattr(current_user, 'user_type') or current_user.user_type != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only businesses can upload business cover images"
        )
    
    # Validate file
    is_valid, error_msg = validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is 25 MB. Your file is {file_size / (1024*1024):.2f} MB"
        )
    
    # current_user is the Business object
    business = current_user
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Delete old cover image if exists
    if business.cover_image:
        old_file_path = UPLOAD_DIR / business.cover_image
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    unique_filename = f"business_{business.id}_cover_{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update business record
    business.cover_image = unique_filename
    db.commit()
    
    return {
        "message": "Cover image uploaded successfully",
        "filename": unique_filename,
        "url": f"/upload/files/{unique_filename}"
    }


@router.delete("/business/profile-image")
async def delete_business_profile_image(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete profile image for business"""
    if not hasattr(current_user, 'user_type') or current_user.user_type != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only businesses can delete business profile images"
        )
    
    # current_user is the Business object
    business = current_user
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Delete file if exists
    if business.profile_image:
        file_path = UPLOAD_DIR / business.profile_image
        if file_path.exists():
            file_path.unlink()
        business.profile_image = None
        db.commit()
        return {"message": "Profile image deleted successfully"}
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No profile image found")


@router.delete("/business/cover-image")
async def delete_business_cover_image(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete cover image for business"""
    if not hasattr(current_user, 'user_type') or current_user.user_type != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only businesses can delete business cover images"
        )
    
    # current_user is the Business object
    business = current_user
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Delete file if exists
    if business.cover_image:
        file_path = UPLOAD_DIR / business.cover_image
        if file_path.exists():
            file_path.unlink()
        business.cover_image = None
        db.commit()
        return {"message": "Cover image deleted successfully"}
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No cover image found")


@router.get("/files/{filename}")
async def get_uploaded_file(filename: str):
    """Get uploaded file"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    # Determine media type
    media_type, _ = mimetypes.guess_type(str(file_path))
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )
