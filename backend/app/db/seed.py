import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.db.models import User, Brand, Category, Product, ProductPrice, PriceHistory, Review, Alert
from app.auth.jwt import get_password_hash
from app.services.ai_service import AIService

# Store names as requested
STORES = [
    "Amazon", "Flipkart", "Meesho", "Myntra", "Zudio", "Zara", "Trends"
]

def get_affiliate_url(store_name: str, query: str) -> str:
    import urllib.parse
    q_encoded = urllib.parse.quote_plus(query)
    store_lower = store_name.lower().strip()
    if "amazon" in store_lower:
        return f"https://www.amazon.in/s?k={q_encoded}&tag=trendysuits-21"
    elif "flipkart" in store_lower:
        return f"https://www.flipkart.com/search?q={q_encoded}&affid=trendysuits"
    elif "meesho" in store_lower:
        return f"https://www.meesho.com/search?q={q_encoded}&utm_source=trendysuits"
    elif "myntra" in store_lower:
        return f"https://www.myntra.com/search?rawQuery={q_encoded}&affid=trendysuits"
    elif "zudio" in store_lower:
        return f"https://www.zudio.com/search?q={q_encoded}&utm_source=trendysuits"
    elif "zara" in store_lower:
        return f"https://www.zara.com/in/en/search?word={q_encoded}&utm_source=trendysuits"
    elif "trends" in store_lower:
        return f"https://www.ajio.com/search/?text={q_encoded}&brand=Trends&utm_source=trendysuits"
    else:
        return f"https://www.{store_lower.replace(' ', '')}.com/search?q={q_encoded}&utm_source=trendysuits"

def seed_db():
    db = SessionLocal()
    
    # 1. Create tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("Database tables created.")

    # 2. Seed Users
    admin_password = get_password_hash("admin123")
    user_password = get_password_hash("user123")
    
    admin = User(
        email="admin@trendysuits.ai",
        hashed_password=admin_password,
        full_name="Alexander McQueen (Admin)",
        role="admin",
        is_active=True
    )
    test_user = User(
        email="user@trendysuits.ai",
        hashed_password=user_password,
        full_name="Jane Doe",
        role="user",
        is_active=True
    )
    
    db.add(admin)
    db.add(test_user)
    db.commit()
    print("Users seeded.")

    # 3. Seed Brands
    brand_data = [
        {"name": "Gucci", "logo_url": "/brands/gucci.png", "description": "Gucci is an Italian luxury fashion house based in Florence, Italy."},
        {"name": "Prada", "logo_url": "/brands/prada.png", "description": "Prada S.p.A. is an Italian luxury fashion house specializing in leather handbags, travel accessories, shoes, ready-to-wear, perfumes and other fashion accessories."},
        {"name": "Nike", "logo_url": "/brands/nike.png", "description": "Nike, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services."},
        {"name": "Balenciaga", "logo_url": "/brands/balenciaga.png", "description": "Balenciaga is a luxury fashion house founded in 1919 by the Spanish designer Cristóbal Balenciaga in San Sebastián, Spain."},
        {"name": "Rolex", "logo_url": "/brands/rolex.png", "description": "Rolex SA is a British-founded Swiss luxury watch manufacturer based in Geneva, Switzerland."},
        {"name": "Zara", "logo_url": "/brands/zara.png", "description": "Zara SA is a Spanish multi-national retail clothing chain. It specializes in fast fashion, and products include clothing, accessories, shoes, swimwear, beauty, and perfumes."},
        {"name": "Ralph Lauren", "logo_url": "/brands/ralphlauren.png", "description": "Ralph Lauren Corporation is an American fashion company producing products ranging from the mid-range to the luxury segments."}
    ]
    
    brands = {}
    for b in brand_data:
        brand = Brand(name=b["name"], logo_url=b["logo_url"], description=b["description"])
        db.add(brand)
        db.commit()
        brands[b["name"]] = brand
        
    print("Brands seeded.")

    # 4. Seed Categories
    clothing = Category(name="Clothing", slug="clothing")
    shoes = Category(name="Shoes", slug="shoes")
    accessories = Category(name="Accessories", slug="accessories")
    
    db.add_all([clothing, shoes, accessories])
    db.commit()
    
    subcategories = [
        Category(name="Jackets & Coats", slug="jackets-coats", parent_id=clothing.id),
        Category(name="Hoodies & Sweatshirts", slug="hoodies-sweatshirts", parent_id=clothing.id),
        Category(name="Dresses", slug="dresses", parent_id=clothing.id),
        Category(name="Sneakers", slug="sneakers", parent_id=shoes.id),
        Category(name="Boots", slug="boots", parent_id=shoes.id),
        Category(name="Bags & Handbags", slug="bags-handbags", parent_id=accessories.id),
        Category(name="Watches", slug="watches", parent_id=accessories.id),
        Category(name="Sunglasses", slug="sunglasses", parent_id=accessories.id),
        Category(name="Suits & Blazers", slug="suits-blazers", parent_id=clothing.id),
    ]
    
    db.add_all(subcategories)
    db.commit()
    
    categories = {sub.slug: sub for sub in subcategories}
    print("Categories and Subcategories seeded.")

    # 5. Seed Products
    # High-quality sample products
    product_data = [
        {
            "title": "Gucci GG Marmont Shoulder Bag",
            "description": "The medium GG Marmont chain shoulder bag has a softly structured shape and an oversized flap closure with double G hardware. The sliding chain strap can be worn multiple ways, changing between a shoulder and a top handle bag. Made in embroidered chevron velvet with a heart on the back.",
            "gender": "women",
            "brand": "Gucci",
            "category": "bags-handbags",
            "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
            "color": "Black",
            "size": "Medium",
            "rating": 4.8,
            "reviews_count": 142,
            "base_original_price": 2500.0,
        },
        {
            "title": "Nike Air Force 1 '07 Premium",
            "description": "The radiance lives on in the Nike Air Force 1 '07, the basketball original that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.",
            "gender": "unisex",
            "brand": "Nike",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
            "color": "White/Gold",
            "size": "US 9",
            "rating": 4.6,
            "reviews_count": 820,
            "base_original_price": 130.0,
        },
        {
            "title": "Prada Re-Edition 2005 Nylon Bag",
            "description": "An iconic style, the Prada Re-Edition 2005 shoulder bag is inspired by the classic mini hobo model and made of Re-Nylon: a regenerated nylon yarn produced from recycled, purified plastic trash collected in the ocean, fishing nets and textile waste fibers.",
            "gender": "women",
            "brand": "Prada",
            "category": "bags-handbags",
            "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
            "color": "Pink",
            "size": "Small",
            "rating": 4.7,
            "reviews_count": 96,
            "base_original_price": 1850.0,
        },
        {
            "title": "Rolex Submariner Date 41mm",
            "description": "The Rolex Submariner Date in Oystersteel with a Cerachrom bezel insert in green ceramic and a black dial with large luminescent hour markers. It features a unidirectional rotatable bezel and solid-link Oyster bracelet. The latest generation Submariner and Submariner Date remain faithful to the original model launched in 1953.",
            "gender": "men",
            "brand": "Rolex",
            "category": "watches",
            "image_url": "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80",
            "color": "Green/Steel",
            "size": "41mm",
            "rating": 4.9,
            "reviews_count": 310,
            "base_original_price": 14500.0,
        },
        {
            "title": "Balenciaga Triple S Sneakers",
            "description": "Triple S clear sole sneakers in black double foam and mesh. 3-layered outsole, clear sole technology. Embroidered size at the edge of the toe, embroidered logo on the side and embossed logo in the back. Complex outsole with TPU injected inside the sole for comfort.",
            "gender": "unisex",
            "brand": "Balenciaga",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1512374382149-4332c6c02150?w=600&auto=format&fit=crop&q=80",
            "color": "Black/Red",
            "size": "US 10",
            "rating": 4.4,
            "reviews_count": 215,
            "base_original_price": 1100.0,
        },
        {
            "title": "Zara Wool Blend Oversized Coat",
            "description": "Oversized lapel collar coat made of wool blend fabric. Long sleeves with cuffs. Front patch pockets. Back vent. Double-breasted button closure on the front.",
            "gender": "women",
            "brand": "Zara",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
            "color": "Camel",
            "size": "Medium",
            "rating": 4.2,
            "reviews_count": 78,
            "base_original_price": 170.0,
        },
        {
            "title": "Ralph Lauren Classic Fit Polo Shirt",
            "description": "An American style standard since 1972, the Polo shirt has been imitated but never equaled. Over the decades, Ralph Lauren has reimagined his signature style in a wide array of colors and fits, yet all retain the quality and attention to detail of the iconic original.",
            "gender": "men",
            "brand": "Ralph Lauren",
            "category": "hoodies-sweatshirts",
            "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
            "color": "Navy Blue",
            "size": "Large",
            "rating": 4.5,
            "reviews_count": 450,
            "base_original_price": 95.0,
        },
        {
            "title": "Gucci Pilot Metal Sunglasses",
            "description": "A classic pilot shape, these metal sunglasses are defined by the web detail on the temples, a subtle nod to the House's equestrian roots. Yellow gold metal frame, green and red signature stripe temples with black tips.",
            "gender": "men",
            "brand": "Gucci",
            "category": "sunglasses",
            "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
            "color": "Gold/Green",
            "size": "One Size",
            "rating": 4.7,
            "reviews_count": 64,
            "base_original_price": 450.0,
        },
        {
            "title": "Gucci Signature Wool Blazer Suit",
            "description": "Tailored from Italian wool, this Gucci signature blazer suit features a structured two-button silhouette, notch lapels, and matching slim-cut trousers. A perfect blend of heritage tailoring and modern luxury fashion.",
            "gender": "men",
            "brand": "Gucci",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
            "color": "Navy Blue",
            "size": "48R",
            "rating": 4.8,
            "reviews_count": 52,
            "base_original_price": 2200.0,
        },
        {
            "title": "Prada Classic Double-Breasted Suit",
            "description": "Classic Prada double-breasted suit designed with peak lapels, side vents, and clean lined trousers. Executed in superfine virgin wool for comfort, durability, and a clean silhouette.",
            "gender": "men",
            "brand": "Prada",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
            "color": "Charcoal Grey",
            "size": "50R",
            "rating": 4.9,
            "reviews_count": 38,
            "base_original_price": 3100.0,
        },
        {
            "title": "Zara Slim Fit Stretch Suit",
            "description": "Slim fit Zara suit blazer featuring a notch lapel, long sleeves with buttoned cuffs, chest welt pocket, and flap pockets at the hip. Created in comfort stretch fabric for all day premium styling.",
            "gender": "men",
            "brand": "Zara",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80",
            "color": "Black",
            "size": "Medium",
            "rating": 4.3,
            "reviews_count": 124,
            "base_original_price": 280.0,
        },
        {
            "title": "Gucci Floral Silk Jacquard Dress",
            "description": "Crafted from refined silk jacquard, this Gucci dress showcases an elegant floral design. Features a high neckline, long sleeves with button cuffs, and a flowing pleated midi skirt. An exquisite selection for luxury events.",
            "gender": "women",
            "brand": "Gucci",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
            "color": "Green Floral",
            "size": "Small",
            "rating": 4.8,
            "reviews_count": 42,
            "base_original_price": 1950.0,
        },
        {
            "title": "Prada Pleated Satin Midi Dress",
            "description": "Prada's midi dress is cut from fluid satin in an elegant pleated profile. Tailored with a flared skirt, boat neck, and a delicate tie belt detailing at the waist. A signature silhouette representing timeless Milanese luxury.",
            "gender": "women",
            "brand": "Prada",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80",
            "color": "Black",
            "size": "Medium",
            "rating": 4.9,
            "reviews_count": 27,
            "base_original_price": 2400.0,
        },
        {
            "title": "Zara Satin Effect Slip Dress",
            "description": "Midi dress featuring a V-neckline and thin adjustable straps. Seamlessly draped satin finish with a back slit at the hem. Perfect for standard partywear or evening styling.",
            "gender": "women",
            "brand": "Zara",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1539008885759-c21b302c0be3?w=600&auto=format&fit=crop&q=80",
            "color": "Burgundy",
            "size": "Medium",
            "rating": 4.4,
            "reviews_count": 89,
            "base_original_price": 79.90,
        }
    ]

    for p_info in product_data:
        # Resolve brand and category
        brand = brands[p_info["brand"]]
        category = categories[p_info["category"]]
        
        # We will dynamically calculate base_price (lowest price)
        # Create product first with dummy base_price
        product = Product(
            title=p_info["title"],
            description=p_info["description"],
            gender=p_info["gender"],
            rating=p_info["rating"],
            reviews_count=p_info["reviews_count"],
            base_price=0.0,
            deal_score=50,
            brand_id=brand.id,
            category_id=category.id,
            image_url=p_info["image_url"],
            color=p_info["color"],
            size=p_info["size"]
        )
        
        db.add(product)
        db.commit()
        
        # Create prices for different stores with random discounts (10% to 40%)
        # Let's seed prices for ALL stores
        prices = []
        base_original = p_info["base_original_price"]
        
        for store in STORES:
            # Randomize discount per store
            # Some stores might be out of stock, some might have high price, some low price
            discount_pct = random.uniform(0.05, 0.35)
            store_price = round(base_original * (1 - discount_pct), 2)
            original_price = base_original
            in_stock = random.choice([True, True, True, False]) # 75% in-stock rate
            
            aff_url = get_affiliate_url(store, product.title)
            p_price = ProductPrice(
                product_id=product.id,
                store_name=store,
                price=store_price,
                original_price=original_price,
                in_stock=in_stock,
                product_url=aff_url,
                affiliate_url=aff_url
            )
            db.add(p_price)
            prices.append(p_price)
            
            # Create Price History (dates: today, 3 days ago, 7 days ago, 30 days ago, 60 days ago, 90 days ago)
            # Make price historical values show a downward trend for good deals, upward or stable for others
            history_intervals = [0, 3, 7, 30, 60, 90, 180, 360]
            price_history_slope = random.uniform(-0.1, 0.05) # generally decreasing or stable
            
            for days_ago in history_intervals:
                record_date = datetime.utcnow() - timedelta(days=days_ago)
                # Historical price is store_price + slope * days_ago + random noise
                historical_price = store_price + (price_history_slope * days_ago) + random.uniform(-store_price*0.03, store_price*0.03)
                historical_price = round(max(base_original * 0.4, historical_price), 2)
                
                p_history = PriceHistory(
                    product_id=product.id,
                    store_name=store,
                    price=historical_price,
                    recorded_at=record_date
                )
                db.add(p_history)
                
        db.commit()
        
        # Calculate base_price (lowest available in stock price)
        instock_prices = [p.price for p in prices if p.in_stock]
        lowest_price = min(instock_prices) if instock_prices else min([p.price for p in prices])
        product.base_price = lowest_price
        
        # Calculate AI deal score
        product.deal_score = AIService.calculate_deal_score(prices, product.rating, product.reviews_count)
        db.commit()
        
        # Create reviews
        reviewer_names = ["Sophia L.", "Liam M.", "Olivia W.", "Noah B.", "Emma D.", "Ethan G."]
        review_comments = [
            ("Amazing Quality!", "Absolutely worth the price. The material is premium and shipping was ultra fast."),
            ("Great styling details", "Slightly expensive but the craftsmanship is outstanding. Highly recommend it."),
            ("Good deal", "Got this on Meesho for a discount. Looks great and fits perfectly."),
            ("Decent product", "Quality is alright, but the price difference between Myntra and Trends was massive. Glad I checked Trendy Suits!"),
            ("Beautiful look", "Very premium luxury feel. Exceeded expectations!"),
        ]
        
        # Assign 3-4 random reviews per product
        for _ in range(random.randint(3, 5)):
            r_rating = random.choice([4, 5, 5, 5]) if product.rating >= 4.5 else random.choice([3, 4, 4, 5])
            r_title, r_comment = random.choice(review_comments)
            
            review = Review(
                user_id=test_user.id,
                product_id=product.id,
                rating=r_rating,
                title=r_title,
                comment=r_comment,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.add(review)
            
        db.commit()

    print("Products, Prices, History, and Reviews seeded.")
    
    # 6. Seed a sample Price Alert for user
    alert = Alert(
        user_id=test_user.id,
        product_id=db.query(Product).first().id,
        target_price=round(db.query(Product).first().base_price * 0.9, 2),
        is_active=True
    )
    db.add(alert)
    db.commit()
    print("Sample Alert seeded.")
    
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
