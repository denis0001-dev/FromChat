from datetime import datetime
from mailbox import Message
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_current_user, get_db
from models import SendMessageRequest


router = APIRouter()


@router.post("/send_message")
def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="No content provided"
        )

    new_message = Message(
        content=request.content.strip(),
        user_id=current_user["user_id"],
        timestamp=datetime.now()
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {"status": "success"}


@router.get("/get_messages")
def get_messages(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).order_by(Message.timestamp.asc()).all()

    messages_data = []
    for msg in messages:
        messages_data.append({
            "id": msg.id,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "is_author": msg.user_id == current_user["user_id"],
            "is_read": msg.is_read,
            "username": msg.author.username
        })

    return {
        "status": "success",
        "messages": messages_data
    }