from fastapi import FastAPI
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware

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


# Security для FastAPI
security = HTTPBearer()