from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# API Key Schemas
class ApiKeyCreate(BaseModel):
    name: Optional[str] = "Default Key"

class ApiKeyResponse(BaseModel):
    id: int
    key: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Scan Schemas
class ScanRequest(BaseModel):
    text: str

class ScanResponse(BaseModel):
    threat_score: int
    threat_type: str
    details: Dict[str, Any]

# Logs Schemas
class ThreatLogResponse(BaseModel):
    id: int
    direction: str
    text_preview: str
    threat_score: int
    threat_type: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Stats Schemas
class DailyStat(BaseModel):
    date: str
    scans: int
    threats: int
    avg_score: float

class StatsResponse(BaseModel):
    total_scans_today: int
    threats_blocked_today: int
    avg_threat_score_today: float
    chart_data: List[DailyStat]
