from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from app.db.session import get_db
from app.db.models import Product, ProductPrice, PriceHistory, Review, Brand, Category, User
from app.db.schemas import (
    ProductResponse, ProductDetailResponse, ReviewCreate, ReviewResponse,
    PredictionResponse, ChatRequest, ChatResponse
)
from app.auth.jwt import get_current_user
from app.services.ai_service import AIService
from app.services.cache_service import cache

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
def get_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    gender: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    min_discount: Optional[float] = None, # Discount percentage e.g. 10 for 10%
    sort_by: Optional[str] = "rating", # price_asc, price_desc, rating, discount, deal_score
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    # Try fetching from cache if it's a simple request
    cache_key = f"products_q{q}_cat{category}_b{brand}_g{gender}_minp{min_price}_maxp{max_price}_minr{min_rating}_mind{min_discount}_sort{sort_by}_skip{skip}_lim{limit}"
    cached_val = cache.get(cache_key)
    if cached_val:
        return cached_val

    query = db.query(Product).join(Brand).join(Category)
    filters = []

    if q:
        search_filter = or_(
            Product.title.ilike(f"%{q}%"),
            Product.description.ilike(f"%{q}%"),
            Brand.name.ilike(f"%{q}%"),
            Category.name.ilike(f"%{q}%")
        )
        filters.append(search_filter)

    if category:
        filters.append(or_(Category.slug == category, Category.name.ilike(category)))

    if brand:
        filters.append(Brand.name.ilike(brand))

    if gender:
        filters.append(Product.gender == gender.lower())

    if min_price is not None:
        filters.append(Product.base_price >= min_price)

    if max_price is not None:
        filters.append(Product.base_price <= max_price)

    if min_rating is not None:
        filters.append(Product.rating >= min_rating)

    if filters:
        query = query.filter(and_(*filters))

    # Handles discount filtering
    if min_discount is not None:
        # Load all candidate products first to calculate discount or join prices
        # For simplicity in database filters, we can join and filter on price difference
        pass

    # Apply sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.base_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.base_price.desc())
    elif sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort_by == "deal_score":
        query = query.order_by(Product.deal_score.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    products = query.offset(skip).limit(limit).all()
    
    # If a specific search term was requested, but no products were found in the database,
    # we dynamically generate and seed 3 matching products in real-time!
    if q and len(products) == 0:
        products = generate_dynamic_products(q, db)
        
    # Filter by discount in memory if requested
    if min_discount is not None:
        filtered_products = []
        for p in products:
            prices = db.query(ProductPrice).filter(ProductPrice.product_id == p.id).all()
            if prices:
                max_discount = 0.0
                for pr in prices:
                    if pr.original_price > 0:
                        disc = (pr.original_price - pr.price) / pr.original_price * 100
                        if disc > max_discount:
                            max_discount = disc
                if max_discount >= min_discount:
                    filtered_products.append(p)
        products = filtered_products

    # Convert to response dicts for caching
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "gender": p.gender,
            "rating": p.rating,
            "reviews_count": p.reviews_count,
            "base_price": p.base_price,
            "deal_score": p.deal_score,
            "image_url": p.image_url,
            "color": p.color,
            "size": p.size,
            "brand": {"id": p.brand.id, "name": p.brand.name, "logo_url": p.brand.logo_url, "description": p.brand.description},
            "category": {"id": p.category.id, "name": p.category.name, "slug": p.category.slug, "parent_id": p.category.parent_id}
        })

    cache.set(cache_key, result, expire_seconds=60) # cache search results for 1 minute
    return result

@router.get("/suggestions")
def get_suggestions(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    # Quick keyword completion auto-suggestions
    suggestions = []
    
    # Check matching brands
    brands = db.query(Brand.name).filter(Brand.name.ilike(f"%{q}%")).limit(3).all()
    suggestions.extend([b[0] for b in brands])
    
    # Check matching categories
    cats = db.query(Category.name).filter(Category.name.ilike(f"%{q}%")).limit(3).all()
    suggestions.extend([c[0] for c in cats])
    
    # Check matching product titles
    prods = db.query(Product.title).filter(Product.title.ilike(f"%{q}%")).limit(5).all()
    suggestions.extend([p[0] for p in prods])
    
    return list(set(suggestions))[:8]

@router.get("/{id}", response_model=ProductDetailResponse)
def get_product_detail(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{id}/prediction", response_model=PredictionResponse)
def get_product_prediction(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    pred_data = AIService.predict_price(product, db)
    return pred_data

@router.post("/{id}/chat", response_model=ChatResponse)
def chat_about_product(id: int, request: ChatRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    reply = AIService.get_shopping_assistant_reply(product, db, request.message)
    return {"reply": reply}

@router.post("/{id}/reviews", response_model=ReviewResponse)
def post_product_review(
    id: int,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    review = Review(
        user_id=current_user.id,
        product_id=product.id,
        rating=review_in.rating,
        title=review_in.title,
        comment=review_in.comment
    )
    db.add(review)
    db.commit()
    
    # Recalculate product rating and reviews count
    all_reviews = db.query(Review.rating).filter(Review.product_id == product.id).all()
    product.reviews_count = len(all_reviews)
    product.rating = round(sum([r[0] for r in all_reviews]) / len(all_reviews), 1)
    
    # Recalculate deal score
    prices = db.query(ProductPrice).filter(ProductPrice.product_id == product.id).all()
    product.deal_score = AIService.calculate_deal_score(prices, product.rating, product.reviews_count)
    
    db.commit()
    db.refresh(review)
    return review


def generate_dynamic_products(q: str, db: Session) -> List[Product]:
    from sqlalchemy.sql.expression import func
    from app.db.models import Brand, Category, Product, ProductPrice, PriceHistory, Review
    import random
    from datetime import datetime, timedelta

    # 1. Clean and normalize query
    q_clean = q.strip()
    q_cap = q_clean.title()

    # 2. Determine category slug based on query
    q_lower = q_clean.lower()
    cat_slug = "clothing"
    if any(x in q_lower for x in ["shoe", "sneaker", "boot", "footwear", "heel"]):
        cat_slug = "sneakers"
    elif any(x in q_lower for x in ["bag", "handbag", "purse", "clutch", "wallet"]):
        cat_slug = "bags-handbags"
    elif "watch" in q_lower:
        cat_slug = "watches"
    elif any(x in q_lower for x in ["glass", "sunglass", "shade", "eyewear"]):
        cat_slug = "sunglasses"
    elif any(x in q_lower for x in ["suit", "blazer", "tuxedo", "formal"]):
        cat_slug = "suits-blazers"
    elif any(x in q_lower for x in ["dress", "gown", "frock", "skirt", "sari", "saree", "lehenga"]):
        cat_slug = "dresses"
    elif any(x in q_lower for x in ["coat", "jacket", "outerwear", "trench"]):
        cat_slug = "jackets-coats"
    elif any(x in q_lower for x in ["hoodie", "sweatshirt", "sweater", "pullover"]):
        cat_slug = "hoodies-sweatshirts"

    category = db.query(Category).filter(Category.slug == cat_slug).first()
    if not category:
        category = db.query(Category).first()

    # 3. Determine image URL category placeholder from Unsplash
    image_url_mapping = {
        "sneakers": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
        "bags-handbags": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
        "watches": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80",
        "sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
        "suits-blazers": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
        "dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
        "jackets-coats": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
        "hoodies-sweatshirts": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
        "clothing": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80"
    }
    image_url_base = image_url_mapping.get(cat_slug, image_url_mapping["clothing"])

    # 4. Generate 3 products covering different price tiers (Budget, Premium, Luxury)
    tiers = [
        {"name": "Budget", "price_range": (100, 490), "brand_name": "Zara", "desc_prefix": "Affordable and stylish"},
        {"name": "Premium", "price_range": (690, 2900), "brand_name": "Ralph Lauren", "desc_prefix": "High-quality, comfort-fit"},
        {"name": "Luxury Designer", "price_range": (4500, 45000), "brand_name": "Gucci", "desc_prefix": "Exclusive couture"}
    ]

    new_products = []

    for tier in tiers:
        # Resolve brand
        brand = db.query(Brand).filter(Brand.name == tier["brand_name"]).first()
        if not brand:
            brand = db.query(Brand).first()

        # Randomize price in range
        min_p, max_p = tier["price_range"]
        base_original_price = round(random.uniform(min_p, max_p), 2)

        title = f"{brand.name} {tier['name']} {q_cap}"
        description = f"{tier['desc_prefix']} {q_lower} crafted with premium styling. Perfect for everyday wear, tailoring, or premium events."
        
        # Add random parameter to image URL to prevent caching the same image
        image_url = image_url_base + f"&sig={random.randint(100, 999)}"

        p = Product(
            title=title,
            description=description,
            gender=random.choice(["men", "women", "unisex"]),
            rating=round(random.uniform(4.0, 4.9), 1),
            reviews_count=random.randint(5, 120),
            base_price=0.0,
            deal_score=50,
            brand_id=brand.id,
            category_id=category.id,
            image_url=image_url,
            color=random.choice(["Black", "Navy", "White", "Beige", "Burgundy"]),
            size=random.choice(["S", "M", "L", "XL", "One Size"])
        )
        db.add(p)
        db.commit()
        db.refresh(p)

        # Create store prices
        prices = []
        stores = ["Flipkart", "Amazon", "Myntra", "Ajio", "Tata Cliq", "Reliance Trends", "Shoppers Stop"]
        
        for store in stores:
            discount_pct = random.uniform(0.05, 0.35)
            store_price = round(base_original_price * (1 - discount_pct), 2)
            
            p_price = ProductPrice(
                product_id=p.id,
                store_name=store,
                price=store_price,
                original_price=base_original_price,
                in_stock=True,
                product_url=f"https://www.{store.lower().replace(' ', '')}.com/search?q={p.title.replace(' ', '+')}",
                affiliate_url=f"https://click.affiliate.trendysuits.ai/redirect?store={store}&prod_id={p.id}"
            )
            db.add(p_price)
            prices.append(p_price)

            # Create price history logs
            for days_ago in [0, 3, 7, 30, 60, 90]:
                hist_p = store_price + random.uniform(-store_price*0.05, store_price*0.05)
                db.add(PriceHistory(
                    store_name=store,
                    price=round(hist_p, 2),
                    product_id=p.id,
                    recorded_at=datetime.utcnow() - timedelta(days=days_ago)
                ))

        db.commit()
        db.refresh(p)

        # Set final base_price and deal_score
        p.base_price = min([pr.price for pr in prices])
        from app.services.ai_service import AIService
        p.deal_score = AIService.calculate_deal_score(prices, p.rating, p.reviews_count)
        db.commit()
        db.refresh(p)

        new_products.append(p)

    return new_products
