from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import engine
from pydantic import BaseModel

Base = declarative_base()


# Модели базы данных
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(200), nullable=False)
    profile_picture = Column(String(255), nullable=True)
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
    profile_picture: str | None

    class Config:
        from_attributes = True


# Создание таблиц
Base.metadata.create_all(bind=engine)