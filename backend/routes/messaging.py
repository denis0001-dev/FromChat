from datetime import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dependencies import get_current_user, get_db
from models import Message, SendMessageRequest, User

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

def convert_message(msg: Message) -> dict:
    return {
        "id": msg.id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
        "is_read": msg.is_read,
        "username": msg.author.username
    }

async def get_messages_inner(db: Session):
    messages = db.query(Message).order_by(Message.timestamp.asc()).all()

    messages_data = []
    for msg in messages:
        messages_data.append(convert_message(msg))

    return {
        "status": "success",
        "messages": messages_data
    }

async def send_message_inner(request: SendMessageRequest, current_user: User, db: Session):
    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="No content provided"
        )

    new_message = Message(
        content=request.content.strip(),
        user_id=current_user.id,
        timestamp=datetime.now()
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {"status": "success", "message": convert_message(new_message)}

@router.post("/send_message")
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await send_message_inner(request, current_user, db)


@router.get("/get_messages")
async def get_messages(db: Session = Depends(get_db)):
    return await get_messages_inner(db)


class MessaggingSocketManager:
    def __init__(self) -> None:
        self.connections: list[WebSocket] = []

    async def send_error(self, websocket: WebSocket, type: str, e: HTTPException):
        await websocket.send_json({"type": type, "error": {"code": e.status_code, "detail": e.detail}})

    async def handle_connection(self, websocket: WebSocket, db: Session):
        while True:
            data = await websocket.receive_json()
            type = data["type"]

            def get_current_user_inner() -> User | None:
                if data["credentials"]:
                    return get_current_user(
                        HTTPAuthorizationCredentials(
                            scheme=data["credentials"]["scheme"], 
                            credentials=data["credentials"]["credentials"]
                        ), 
                        db
                    )
                else:
                    return None

            if type == "ping":
                await websocket.send_json({"type": "ping", "data": {"status": "success"}})
            elif type == "getMessages":
                try:
                    current_user = get_current_user_inner()
                    if not current_user:
                        raise HTTPException(401)

                    await websocket.send_json({"type": type, "data": await get_messages_inner(current_user, db)})
                except HTTPException as e:
                    await self.send_error(websocket, type, e)
            elif type == "sendMessage":
                try:
                    current_user = get_current_user_inner()
                    if not current_user:
                        raise HTTPException(401)
                    
                    request: SendMessageRequest = SendMessageRequest.model_validate(data["data"])

                    response = await send_message_inner(request, current_user, db)
                    await self.broadcast({
                        "type": "newMessage",
                        "data": response["message"]
                    })

                    await websocket.send_json({"type": type, "data": response})
                except HTTPException as e:
                    await self.send_error(websocket, type, e)
            else:
                await websocket.send_json({"type": type, "error": {"code": 400, "detail": "Invalid type"}})

    async def disconnect(self, websocket: WebSocket, code: int = 1000, message: str | None = None):
        try:
            await websocket.close(code=code, reason=message)
        finally: 
            self.connections.remove(websocket)
    
    async def connect(self, websocket: WebSocket, db: Session):
        await websocket.accept()
        self.connections.append(websocket)
        try:
            await self.handle_connection(websocket, db)
        except WebSocketDisconnect as e:
            logger.info(f"WebSocket disconnected with code {e.code}: {e.reason}")
        finally:
            self.connections.remove(websocket)

    async def broadcast(self, message: dict):
        for websocket in self.connections:
            await websocket.send_json(message)

messagingManager = MessaggingSocketManager()

@router.websocket("/chat/ws")
async def chat_websocket(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    await messagingManager.connect(websocket, db)