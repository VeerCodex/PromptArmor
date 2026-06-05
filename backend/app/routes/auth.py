from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas, auth

router = APIRouter()

@router.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_pwd = auth.get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Support raw JSON post login as well for easy programmatic integrations
@router.post("/auth/login-json", response_model=schemas.Token)
def login_json(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/api-key", response_model=schemas.ApiKeyResponse)
def create_api_key(key_in: schemas.ApiKeyCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    api_key_str = auth.generate_api_key_string()
    new_key = models.ApiKey(
        key=api_key_str,
        name=key_in.name,
        user_id=current_user.id
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    return new_key

@router.get("/api-key", response_model=List[schemas.ApiKeyResponse])
def list_api_keys(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    keys = db.query(models.ApiKey).filter(models.ApiKey.user_id == current_user.id).all()
    return keys

@router.delete("/api-key/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(key_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    key_entry = db.query(models.ApiKey).filter(models.ApiKey.id == key_id, models.ApiKey.user_id == current_user.id).first()
    if not key_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API Key not found or does not belong to this user"
        )
    db.delete(key_entry)
    db.commit()
    return None
