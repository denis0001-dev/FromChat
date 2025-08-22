import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from constants import DATABASE_URL

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)