from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.db.models import Product, ProductPrice, PriceHistory, Brand, Category, User, Alert
from app.db.schemas import ProductResponse, ProductCreate, ProductUpdate, UserResponse, AnalyticsResponse
from app.auth.jwt import get_current_admin_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    # Retrieve counts
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_alerts = db.query(Alert).filter(Alert.is_active == True).count()
    
    # Calculate simulated earnings (sum of mock affiliate click redirections)
    total_affiliate_earnings = round(total_products * 14.2 + total_users * 3.8 + 2450.5, 2)
    total_traffic = total_products * 125 + total_users * 42 + 8420
    
    # Chart data
    earnings_by_month = [
        {"name": "Jan", "earnings": 400.0},
        {"name": "Feb", "earnings": 800.0},
        {"name": "Mar", "earnings": 1200.0},
        {"name": "Apr", "earnings": 1800.0},
        {"name": "May", "earnings": 2200.0},
        {"name": "Jun", "earnings": total_affiliate_earnings * 0.4},
    ]
    
    traffic_by_store = [
        {"name": "Amazon", "value": 4000},
        {"name": "Flipkart", "value": 3000},
        {"name": "Myntra", "value": 4500},
        {"name": "Ajio", "value": 2500},
        {"name": "Tata Cliq", "value": 1500},
        {"name": "Nykaa Fashion", "value": 2000},
        {"name": "Reliance Trends", "value": 1000},
        {"name": "Shoppers Stop", "value": 1200},
    ]
    
    user_signups_by_day = [
        {"day": "Mon", "count": 12},
        {"day": "Tue", "count": 19},
        {"day": "Wed", "count": 15},
        {"day": "Thu", "count": 22},
        {"day": "Fri", "count": 30},
        {"day": "Sat", "count": 45},
        {"day": "Sun", "count": 35},
    ]
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_alerts": total_alerts,
        "total_affiliate_earnings": total_affiliate_earnings,
        "total_traffic": total_traffic,
        "earnings_by_month": earnings_by_month,
        "traffic_by_store": traffic_by_store,
        "user_signups_by_day": user_signups_by_day
    }

@router.get("/products", response_model=List[ProductResponse])
def admin_list_products(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    return db.query(Product).all()

@router.post("/products", response_model=ProductResponse)
def admin_create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    # Resolve brand
    brand = db.query(Brand).filter(Brand.name.ilike(prod_in.brand_name)).first()
    if not brand:
        brand = Brand(name=prod_in.brand_name, logo_url="/brands/default.png", description=f"Brand {prod_in.brand_name}")
        db.add(brand)
        db.commit()
        db.refresh(brand)
        
    # Resolve category
    category = db.query(Category).filter(Category.slug == prod_in.category_slug).first()
    if not category:
        category = db.query(Category).first() # Fallback to first existing category
        
    # Calculate base_price (lowest price)
    prices_input = prod_in.prices
    if not prices_input:
        raise HTTPException(status_code=400, detail="Product must have at least one store price feed.")
        
    lowest_price = min([p.price for p in prices_input])
    
    # Create product
    product = Product(
        title=prod_in.title,
        description=prod_in.description,
        gender=prod_in.gender,
        rating=4.5, # Default initial rating
        reviews_count=1,
        base_price=lowest_price,
        deal_score=50,
        brand_id=brand.id,
        category_id=category.id,
        image_url=prod_in.image_url,
        color=prod_in.color,
        size=prod_in.size
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Save prices and write initial price history
    prices_list = []
    for p in prices_input:
        db_price = ProductPrice(
            product_id=product.id,
            store_name=p.store_name,
            price=p.price,
            original_price=p.original_price,
            in_stock=p.in_stock,
            product_url=p.product_url,
            affiliate_url=f"https://click.affiliate.trendysuits.ai/redirect?store={p.store_name}&prod_id={product.id}"
        )
        db.add(db_price)
        prices_list.append(db_price)
        
        # Write history point
        history_entry = PriceHistory(
            product_id=product.id,
            store_name=p.store_name,
            price=p.price
        )
        db.add(history_entry)
        
    db.commit()
    
    # Calculate AI Deal score
    product.deal_score = AIService.calculate_deal_score(prices_list, product.rating, product.reviews_count)
    db.commit()
    db.refresh(product)
    
    return product

@router.put("/products/{id}", response_model=ProductResponse)
def admin_update_product(
    id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = prod_in.dict(exclude_unset=True)
    
    # Resolve brand if updated
    if "brand_name" in update_data:
        brand_name = update_data.pop("brand_name")
        brand = db.query(Brand).filter(Brand.name.ilike(brand_name)).first()
        if not brand:
            brand = Brand(name=brand_name, logo_url="/brands/default.png", description=f"Brand {brand_name}")
            db.add(brand)
            db.commit()
            db.refresh(brand)
        product.brand_id = brand.id
        
    # Resolve category if updated
    if "category_slug" in update_data:
        cat_slug = update_data.pop("category_slug")
        category = db.query(Category).filter(Category.slug == cat_slug).first()
        if category:
            product.category_id = category.id
            
    for field, value in update_data.items():
        setattr(product, field, value)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(product)
    db.commit()
    return

@router.get("/users", response_model=List[UserResponse])
def admin_list_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    return db.query(User).all()
