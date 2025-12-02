# backend/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import AsyncGenerator

# Use 'sqlite+aiosqlite' for asynchronous SQLite connection
DATABASE_URL = "sqlite+aiosqlite:///./finance.db"

# 1. Base Class for Models
class Base(DeclarativeBase):
    pass

# 2. Engine and Session Maker
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False} # Required for SQLite
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False, # Recommended for async
)

# 3. Dependency for API Endpoints
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Function to create tables (called on startup)
async def init_db():
    async with engine.begin() as conn:
        # Import models here to ensure they are registered with Base
        import models
        await conn.run_sync(Base.metadata.create_all)

