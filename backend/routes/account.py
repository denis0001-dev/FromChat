from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies import get_current_user, get_db
from models import LoginRequest, RegisterRequest, User
from utils import create_token, get_password_hash, verify_password
from validation import is_valid_password, is_valid_username

router = APIRouter()

@router.get("/check_auth")
def check_auth(current_user: dict = Depends(get_current_user)):
    return {
        "authenticated": True,
        "username": current_user["username"]
    }


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username.strip()).first()

    if not user or not verify_password(request.password.strip(), user.password_hash):
        raise HTTPException(
            status_code=401,
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


@router.post("/register")
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

@router.get("/logout")
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