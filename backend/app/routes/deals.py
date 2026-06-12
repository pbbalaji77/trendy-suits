from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.db.models import Product, ProductPrice, User
from app.db.schemas import ProductResponse
from app.auth.jwt import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/deals", tags=["deals"])

@router.get("/trending", response_model=List[ProductResponse])
def get_trending_deals(
    limit: int = 12,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Retrieve products with high deal score and ratings, representing great opportunities
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.has(slug=category))
        
    # Order by deal score descending (highest AI rating)
    deals = query.order_by(Product.deal_score.desc(), Product.rating.desc()).limit(limit).all()
    return deals

@router.get("/recommendations", response_model=List[ProductResponse])
def get_ai_recommendations(
    wishlist_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db),
    # Allow authentication optionally (if logged in, we can get current user wishlist)
):
    # Generate recommendations
    recommended = AIService.get_recommendations(db, wishlist_ids=wishlist_ids)
    return recommended
