from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from dependencies import get_current_user, get_db
from models import Message, SendMessageRequest


router = APIRouter()

async def get_messages_inner(current_user: dict, db: Session):
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


@router.post("/send_message")
async def send_message(
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
async def get_messages(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await get_messages_inner(current_user, db)


@router.websocket("/chat/ws")
async def messaging(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_json()

        if data.type == "ping":
            await websocket.send_json({"type": "ping", "data": {"status": "success"}})
        elif data.type == "getMessages":
            try:
                current_user = get_current_user()
                db = next(get_db())

                await websocket.send_json({"type": "getMessages", "data": await get_messages_inner(current_user, db)})
            except HTTPException as e:
                await websocket.send_json({"type": "getMessages", "error": {"code": e.status_code, "detail": e.detail}})
        else:
            await websocket.send_json({"type": data.type, "error": {"code": 400, "detail": "Invalid type"}})