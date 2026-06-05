from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import hashlib
import json
import logging

from ..database import get_db, redis_client
from .. import models, schemas, auth
from ..scanner import scan_input_text, scan_output_text

logger = logging.getLogger("promptarmor.scan")
router = APIRouter()

def get_cache_key(direction: str, api_key_id: int, text: str) -> str:
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    return f"scan_cache:{direction}:{api_key_id}:{text_hash}"

@router.post("/scan/input", response_model=schemas.ScanResponse)
def scan_input(
    req: schemas.ScanRequest,
    api_auth: tuple = Depends(auth.get_api_key_user),
    db: Session = Depends(get_db)
):
    current_user, api_key = api_auth
    text = req.text
    
    # 1. Check Cache
    cache_key = get_cache_key("input", api_key.id, text)
    try:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            logger.info("Cache hit for input scan")
            # Parse and return
            result = json.loads(cached_result.decode("utf-8") if isinstance(cached_result, bytes) else cached_result)
            
            # Still write log to DB for audit history even on cache hits
            new_log = models.ThreatLog(
                user_id=current_user.id,
                api_key_id=api_key.id,
                direction="input",
                text_preview=text[:200] if len(text) > 200 else text,
                threat_score=result["threat_score"],
                threat_type=result["threat_type"],
                details=result["details"]
            )
            db.add(new_log)
            db.commit()
            
            return result
    except Exception as e:
        logger.warning(f"Error checking cache: {e}")

    # 2. Perform Scan
    score, threat_type, details = scan_input_text(text)
    response_data = {
        "threat_score": score,
        "threat_type": threat_type,
        "details": details
    }

    # 3. Cache Result (expire in 2 hours = 7200 seconds)
    try:
        redis_client.setex(cache_key, 7200, json.dumps(response_data))
    except Exception as e:
        logger.warning(f"Error setting cache: {e}")

    # 4. Save Log to DB
    new_log = models.ThreatLog(
        user_id=current_user.id,
        api_key_id=api_key.id,
        direction="input",
        text_preview=text[:200] if len(text) > 200 else text,
        threat_score=score,
        threat_type=threat_type,
        details=details
    )
    db.add(new_log)
    db.commit()

    return response_data

@router.post("/scan/output", response_model=schemas.ScanResponse)
def scan_output(
    req: schemas.ScanRequest,
    api_auth: tuple = Depends(auth.get_api_key_user),
    db: Session = Depends(get_db)
):
    current_user, api_key = api_auth
    text = req.text
    
    # 1. Check Cache
    cache_key = get_cache_key("output", api_key.id, text)
    try:
        cached_result = redis_client.get(cache_key)
        if cached_result:
            logger.info("Cache hit for output scan")
            result = json.loads(cached_result.decode("utf-8") if isinstance(cached_result, bytes) else cached_result)
            
            # Create audit log
            new_log = models.ThreatLog(
                user_id=current_user.id,
                api_key_id=api_key.id,
                direction="output",
                text_preview=text[:200] if len(text) > 200 else text,
                threat_score=result["threat_score"],
                threat_type=result["threat_type"],
                details=result["details"]
            )
            db.add(new_log)
            db.commit()
            
            return result
    except Exception as e:
        logger.warning(f"Error checking cache: {e}")

    # 2. Perform Scan
    score, threat_type, details = scan_output_text(text)
    response_data = {
        "threat_score": score,
        "threat_type": threat_type,
        "details": details
    }

    # 3. Cache Result (expire in 2 hours)
    try:
        redis_client.setex(cache_key, 7200, json.dumps(response_data))
    except Exception as e:
        logger.warning(f"Error setting cache: {e}")

    # 4. Save Log to DB
    new_log = models.ThreatLog(
        user_id=current_user.id,
        api_key_id=api_key.id,
        direction="output",
        text_preview=text[:200] if len(text) > 200 else text,
        threat_score=score,
        threat_type=threat_type,
        details=details
    )
    db.add(new_log)
    db.commit()

    return response_data
