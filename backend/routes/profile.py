from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from PIL import Image
import os
import uuid
import io

from dependencies import get_db, get_current_user
from models import User

router = APIRouter()

# Create uploads directory if it doesn't exist
PROFILE_PICTURES_DIR = Path("data/uploads/pfp")

os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    profile_picture: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process a profile picture
    """
    # Validate file type
    if not profile_picture.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size (max 5MB)
    if profile_picture.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    try:
        # Read and process the image
        image_data = await profile_picture.read()
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to a reasonable size (200x200)
        image.thumbnail((200, 200), Image.Resampling.LANCZOS)
        
        # Generate unique filename
        filename = f"{current_user.id}_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(PROFILE_PICTURES_DIR, filename)
        
        # Save the processed image
        image.save(filepath, 'JPEG', quality=85)
        
        # Update user's profile picture in database
        profile_picture_url = f"/api/profile-picture/{filename}"
        current_user.profile_picture = profile_picture_url
        db.commit()
        
        return {
            "message": "Profile picture uploaded successfully",
            "profile_picture_url": profile_picture_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.get("/profile-picture/{filename}")
async def get_profile_picture(filename: str):
    """
    Serve profile picture files
    """
    filepath = os.path.join(PROFILE_PICTURES_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Profile picture not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(filepath, media_type="image/jpeg")

@router.get("/user/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile information
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "profile_picture": current_user.profile_picture,
        "online": current_user.online,
        "last_seen": current_user.last_seen,
        "created_at": current_user.created_at
    }
