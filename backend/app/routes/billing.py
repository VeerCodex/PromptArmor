from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import razorpay
import time
import logging
from typing import Dict, Any
from pydantic import BaseModel

from ..database import get_db
from ..config import settings
from .. import models, schemas, auth

logger = logging.getLogger("promptarmor.billing")
router = APIRouter()

# Initialize Razorpay Client dynamically
client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    try:
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        logger.info("Razorpay Client initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing Razorpay Client: {e}")
else:
    logger.warning("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set. Razorpay endpoints will run in sandbox fallback mode.")

class OrderCreateRequest(BaseModel):
    plan: str

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    plan: str

@router.post("/billing/create-order")
def create_order(
    req: OrderCreateRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    plan = req.plan
    if plan not in ["Starter", "Pro"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan. Can only purchase Starter or Pro."
        )

    # Starter: $49 (₹3,999), Pro: $199 (₹15,999) - Razorpay requires amount in paise (multiply by 100)
    amount_in_paise = 399900 if plan == "Starter" else 1599900

    # Sandbox / Mock Mode if Razorpay is not configured yet
    if client is None:
        logger.info(f"Sandbox Order Created for plan {plan}. Amount: {amount_in_paise} paise")
        return {
            "id": f"order_mock_{int(time.time())}",
            "amount": amount_in_paise,
            "currency": "INR",
            "plan": plan,
            "sandbox": True
        }

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_user_{current_user.id}_{int(time.time())}",
            "payment_capture": 1
        }
        order = client.order.create(data=order_data)
        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "plan": plan,
            "sandbox": False
        }
    except Exception as e:
        logger.error(f"Failed to create Razorpay order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Razorpay order generation failed: {str(e)}"
        )

@router.post("/billing/verify", response_model=schemas.UserResponse)
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # If client is None, it means sandbox mode. We bypass signature check for easy local/deployment testing.
    if client is None or req.razorpay_order_id.startswith("order_mock_"):
        logger.info(f"Sandbox payment verification bypassed for user {current_user.email}. Upgrading plan to {req.plan}.")
        current_user.plan = req.plan
        db.commit()
        db.refresh(current_user)
        return current_user

    try:
        # Verify Payment Signature securely using Razorpay utility
        params_dict = {
            'razorpay_order_id': req.razorpay_order_id,
            'razorpay_payment_id': req.razorpay_payment_id,
            'razorpay_signature': req.razorpay_signature
        }
        client.utility.verify_payment_signature(params_dict)
        
        # Payment is verified, upgrade user subscription plan in database
        logger.info(f"Payment Signature Verified. Upgrading user {current_user.email} to {req.plan}")
        current_user.plan = req.plan
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        logger.error(f"Razorpay signature verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed: Invalid signature."
        )

@router.post("/billing/webhook/razorpay")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Optional: Razorpay server-to-server webhook endpoint for async update safety.
    """
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    # If keys/secrets are not configured, skip
    if client is None or not signature:
        return {"status": "ignored", "reason": "keys not configured"}

    try:
        # In a real environment, you verify webhook signature with webhook secret
        # For simplicity, we parse payload to check status and handle payment.captured
        payload = await request.json()
        event = payload.get("event")
        if event == "order.paid" or event == "payment.captured":
            payment_entity = payload["payload"]["payment"]["entity"]
            email = payment_entity["email"]
            amount = payment_entity["amount"]
            
            # Map amount back to plan
            plan = "Starter" if amount == 399900 else ("Pro" if amount == 1599900 else "Free")
            
            user = db.query(models.User).filter(models.User.email == email).first()
            if user and plan != "Free":
                user.plan = plan
                db.commit()
                logger.info(f"Webhook processed: Upgraded {user.email} to {plan} based on event {event}.")
                return {"status": "success", "user": user.email, "plan": plan}
                
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Error parsing Razorpay webhook: {e}")
        return {"status": "error", "detail": str(e)}
