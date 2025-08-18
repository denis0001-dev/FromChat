from datetime import datetime
from email.policy import HTTP
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from dependencies import get_current_user, get_db
from models import Message, SendMessageRequest


router = APIRouter()

def convert_message(msg: Message, current_user: dict) -> dict:
    return {
        "id": msg.id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
        "is_author": msg.user_id == current_user["user_id"],
        "is_read": msg.is_read,
        "username": msg.author.username
    }

async def get_messages_inner(current_user: dict, db: Session):
    messages = db.query(Message).order_by(Message.timestamp.asc()).all()

    messages_data = []
    for msg in messages:
        messages_data.append(convert_message(msg, current_user))

    return {
        "status": "success",
        "messages": messages_data
    }

async def send_message_inner(request: SendMessageRequest, current_user: dict, db: Session):
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

    return {"status": "success", "message": convert_message(new_message, current_user)}

@router.post("/send_message")
async def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await send_message_inner(request, current_user, db)


@router.get("/get_messages")
async def get_messages(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await get_messages_inner(current_user, db)


class MessaggingSocketManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []

    def get_dependencies(self):
        return get_current_user(), next(get_db())

    async def send_error(self, websocket: WebSocket, type: str, e: HTTPException):
        await websocket.send_json({"type": type, "error": {"code": e.status_code, "detail": e.detail}})

    async def handle_connection(self, websocket: WebSocket):
        while True:
            data = await websocket.receive_json()

            if data.type == "ping":
                await websocket.send_json({"type": "ping", "data": {"status": "success"}})
            elif data.type == "getMessages":
                try:
                    current_user, db = self.get_dependencies()

                    await websocket.send_json({"type": data.type, "data": await get_messages_inner(current_user, db)})
                except HTTPException as e:
                    await self.send_error(websocket, data.type, e)
            elif data.type == "sendMessage":
                try:
                    current_user, db = self.get_dependencies()
                    request: SendMessageRequest = SendMessageRequest.model_validate(data.data)

                    response = await send_message_inner(request, current_user, db)
                    await self.broadcast({
                        "type": "newMessage",
                        "data": response.message
                    })

                    await websocket.send_json({"type": data.type, "data": response})
                except HTTPException as e:
                    await self.send_error(websocket, data.type, e)
            else:
                await websocket.send_json({"type": data.type, "error": {"code": 400, "detail": "Invalid type"}})

    async def disconnect(self, websocket: WebSocket, code: int = 1000, message: str | None = None):
        try:
            await websocket.close(code=code, reason=message)
        finally: 
            self.connections.remove(websocket)
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
        try:
            await self.handle_connection(websocket)
        finally:
            self.connections.remove(websocket)

    async def broadcast(self, message: dict):
        for websocket in self.connections:
            await websocket.send_json(message)

messagingManager = MessaggingSocketManager()

@router.websocket("/chat/ws")
async def messaging(websocket: WebSocket):
    await messagingManager.connect(websocket)