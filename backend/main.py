from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from constants import *
from db import *
from models import *
from validation import *
from utils import *
from dependencies import *
from app import *


# API маршруты
@app.get("/check_auth")
def check_auth(current_user: dict = Depends(get_current_user)):
    return {
        "authenticated": True,
        "username": current_user["username"]
    }


@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username.strip()).first()

    if not user or not verify_password(request.password.strip(), user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль"
        )

    user.online = True
    user.last_seen = datetime.now()
    db.commit()

    token = create_token(user.id, user.username)

    return {
        "status": "success",
        "message": "Login successful",
        "token": token,
        "username": user.username
    }


@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    username = request.username.strip()
    password = request.password.strip()
    confirm_password = request.confirm_password.strip()

    # Validate input
    if not is_valid_username(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя должно быть от 3 до 20 символов и не содержать пробелов"
        )

    if not is_valid_password(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль должен быть от 5 до 50 символов и не содержать пробелов"
        )

    if password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароли не совпадают"
        )

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Это имя пользователя уже занято"
        )

    hashed_password = get_password_hash(password)
    new_user = User(
        username=username,
        password_hash=hashed_password,
        online=True,
        last_seen=datetime.now()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": "Регистрация прошла успешно Теперь вы можете войти."
    }


@app.post("/send_message")
def send_message(
    request: SendMessageRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not request.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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


@app.get("/get_messages")
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


@app.get("/logout")
def logout(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if user:
        user.online = False
        user.last_seen = datetime.now()
        db.commit()

    return {
        "status": "success",
        "message": "Logged out successfully"
    }
