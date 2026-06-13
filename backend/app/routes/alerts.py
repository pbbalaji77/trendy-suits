from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import Alert, Product, User
from app.db.schemas import AlertCreate, AlertResponse
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[AlertResponse])
def get_user_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alerts = db.query(Alert).filter(Alert.user_id == current_user.id).all()
    return alerts

@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_price_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == alert_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Check if alert already exists for this product
    existing = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.product_id == alert_in.product_id,
        Alert.is_active == True
    ).first()
    if existing:
        # Update target price and settings instead of creating double
        existing.target_price = alert_in.target_price
        existing.notify_offer_start = alert_in.notify_offer_start
        existing.notify_offer_end = alert_in.notify_offer_end
        db.commit()
        db.refresh(existing)
        return existing
        
    alert = Alert(
        user_id=current_user.id,
        product_id=alert_in.product_id,
        target_price=alert_in.target_price,
        is_active=True,
        notify_offer_start=alert_in.notify_offer_start,
        notify_offer_end=alert_in.notify_offer_end
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_alert(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")
        
    db.delete(alert)
    db.commit()
    return
