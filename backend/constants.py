import os


DATABASE_URL = "sqlite:///./data/database.db"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
OWNER_USERNAME = "denis0001-dev"
JWT_SECRET_KEY = os.getenv("JWT_SECRET")

if not JWT_SECRET_KEY:
    raise ValueError("JWT secret key empty")