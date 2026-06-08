from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import hashlib
import json
import logging
import time

from ..database import get_db, redis_client
from .. import models, schemas, auth
from ..scanner import scan_input_text, scan_output_text

logger = logging.getLogger("promptarmor.scan")
router = APIRouter()

def get_cache_key(direction: str, api_key_id: int, text: str) -> str:
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    return f"scan_cache:{direction}:{api_key_id}:{text_hash}"

def check_rate_limit(api_key_id: int, plan: str):
    limit = 10 if plan == "Free" else (200 if plan == "Starter" else 1000)
    current_ts = int(time.time() / 60)
    key = f"rate_limit:{api_key_id}:{current_ts}"
    try:
        val = redis_client.get(key)
        count = int(val.decode("utf-8") if isinstance(val, bytes) else val) if val else 0
        if count >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Plan '{plan}' is limited to {limit} requests per minute. Upgrade your plan in the dashboard."
            )
        redis_client.setex(key, 65, str(count + 1))
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Error checking rate limits: {e}")

@router.post("/scan/input", response_model=schemas.ScanResponse)
def scan_input(
    req: schemas.ScanRequest,
    api_auth: tuple = Depends(auth.get_api_key_user),
    db: Session = Depends(get_db)
):
    current_user, api_key = api_auth
    check_rate_limit(api_key.id, current_user.plan)
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
    score, threat_type, details = scan_input_text(text, plan=current_user.plan)
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
    if current_user.plan == "Free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Output scanning is only available on Starter or Pro plans. Upgrade your subscription plan in the dashboard."
        )
    check_rate_limit(api_key.id, current_user.plan)
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
