from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from datetime import datetime, timedelta
import jwt
import re
from typing import Optional
from pydantic import BaseModel
import bcrypt

from constants import *

# Инициализация FastAPI
app = FastAPI(title="PixelChat")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене замените на нужные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка базы данных
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Модели базы данных
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    online = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)
    messages = relationship("Message", back_populates="author", lazy="select")


class Message(Base):
    __tablename__ = "message"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    is_read = Column(Boolean, default=False)

    author = relationship("User", back_populates="messages")


# Валидация данных
def is_valid_username(username: str) -> bool:
    if len(username) < 3 or len(username) > 20:
        return False
    if re.search(r'[\s\u180E\u200B-\u200D\u2060\uFEFF]', username):
        return False
    return True


def is_valid_password(password: str) -> bool:
    if len(password) < 5 or len(password) > 50:
        return False
    if re.search(r'[\s\u180E\u200B-\u200D\u2060\uFEFF]', password):
        return False
    return True


# JWT Helper Functions
def create_token(user_id: int, username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# Security для FastAPI
security = HTTPBearer()


# Зависимость для получения текущего пользователя
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(lambda: SessionLocal())
):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": user.id, "username": user.username}


# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic модели
class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str


class SendMessageRequest(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    is_author: bool
    is_read: bool
    username: str

    class Config:
        from_attributes = True


# Создание таблиц
Base.metadata.create_all(bind=engine)


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
