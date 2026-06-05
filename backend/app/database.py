from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging
from .config import settings

logger = logging.getLogger("promptarmor.database")
logging.basicConfig(level=logging.INFO)

# Database Setup
DATABASE_URL = settings.DATABASE_URL or "sqlite:///./promptarmor.db"
is_sqlite = DATABASE_URL.startswith("sqlite")

connect_args = {}
if is_sqlite:
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        logger.info(f"Successfully connected to database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
except Exception as e:
    logger.warning(f"Failed to connect to database {DATABASE_URL}: {e}")
    logger.warning("Falling back to local SQLite database: sqlite:///./promptarmor_fallback.db")
    DATABASE_URL = "sqlite:///./promptarmor_fallback.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# In-memory Redis Fallback Client
class InMemoryCache:
    def __init__(self):
        self._store = {}

    def get(self, key: str):
        if key in self._store:
            val, expiry = self._store[key]
            if expiry is None or expiry > time.time():
                return val.encode("utf-8") if isinstance(val, str) else val
            else:
                del self._store[key]
        return None

    def setex(self, key: str, time_seconds: int, value: str):
        self._store[key] = (value, time.time() + time_seconds)
        return True

    def ping(self):
        return True


# Cache client initialization
redis_client = None
if settings.REDIS_URL:
    try:
        import redis
        redis_client = redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        redis_client.ping()
        logger.info(f"Successfully connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.warning(f"Redis connection failed ({e}). Falling back to in-memory cache.")
        redis_client = InMemoryCache()
else:
    logger.info("REDIS_URL not configured. Using in-memory cache.")
    redis_client = InMemoryCache()
