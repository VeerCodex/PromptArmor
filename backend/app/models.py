from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    threat_logs = relationship("ThreatLog", back_populates="user", cascade="all, delete-orphan")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="Default Key")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="api_keys")
    threat_logs = relationship("ThreatLog", back_populates="api_key")

class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"), nullable=False)
    direction = Column(String, nullable=False)  # "input" or "output"
    text_preview = Column(Text, nullable=False)
    threat_score = Column(Integer, nullable=False)  # 0 to 100
    threat_type = Column(String, nullable=False)  # e.g., "None", "PII", "Jailbreak", "Prompt Injection", "Data Leakage"
    details = Column(JSON, nullable=True)  # List of exact findings (e.g. {"emails": ["..."]})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="threat_logs")
    api_key = relationship("ApiKey", back_populates="threat_logs")
