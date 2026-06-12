from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.models import Product
from app.db.seed import seed_db
from app.routes import auth, products, deals, alerts, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is empty
    db = SessionLocal()
    try:
        product_count = db.query(Product).count()
        if product_count == 0:
            print("Database is empty. Seeding initial data...")
            seed_db()
        else:
            print(f"Database already contains {product_count} products. Skipping seed.")
    except Exception as e:
        print(f"Error checking/seeding database: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Trendy Suits AI API - Modern Fashion Price Comparison Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity in development/production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(deals.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "message": "Welcome to Trendy Suits AI Price Comparison Engine. Access /docs for Swagger interactive API documentation."
    }
