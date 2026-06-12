from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Brand Schemas
class BrandBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

class BrandResponse(BrandBase):
    id: int

    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Product Price Schemas
class ProductPriceBase(BaseModel):
    store_name: str
    price: float
    original_price: float
    in_stock: bool
    product_url: str
    affiliate_url: Optional[str] = None

class ProductPriceResponse(ProductPriceBase):
    id: int
    product_id: int
    last_updated: datetime

    class Config:
        from_attributes = True

# Price History Schemas
class PriceHistoryResponse(BaseModel):
    id: int
    store_name: str
    price: float
    recorded_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    created_at: datetime
    user: UserBase

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    gender: str
    rating: float
    reviews_count: int
    base_price: float
    deal_score: int
    image_url: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    brand: BrandResponse
    category: CategoryResponse

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    prices: List[ProductPriceResponse]
    price_history: List[PriceHistoryResponse]
    reviews: List[ReviewResponse]

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    gender: str
    brand_name: str
    category_slug: str
    image_url: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    prices: List[ProductPriceBase]

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    gender: Optional[str] = None
    brand_name: Optional[str] = None
    category_slug: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    base_price: Optional[float] = None
    deal_score: Optional[int] = None

# Alert Schemas
class AlertCreate(BaseModel):
    product_id: int
    target_price: float

class AlertResponse(BaseModel):
    id: int
    product_id: int
    target_price: float
    is_active: bool
    created_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True

# AI Chat Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# Price Prediction Schemas
class PredictionResponse(BaseModel):
    current_price: float
    predicted_trend: str # "up", "down", "stable"
    confidence: float # 0.0 - 1.0
    recommendation: str # "Buy Now", "Wait for Drop", "High Demand - Buy Fast"
    chart_data: List[dict] # { day: str, price: float }

# Admin Schemas
class AnalyticsResponse(BaseModel):
    total_users: int
    total_products: int
    total_alerts: int
    total_affiliate_earnings: float
    total_traffic: int
    earnings_by_month: List[dict] # { name: str, earnings: float }
    traffic_by_store: List[dict] # { name: str, value: int }
    user_signups_by_day: List[dict] # { day: str, count: int }
