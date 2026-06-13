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
        {"name": "Nike", "logo_url": "/brands/nike.png", "description": "Nike, Inc. is an American clothing/footwear corporation."},
        {"name": "Balenciaga", "logo_url": "/brands/balenciaga.png", "description": "Balenciaga is a luxury fashion house."},
        {"name": "Rolex", "logo_url": "/brands/rolex.png", "description": "Rolex SA is a luxury watch manufacturer."},
        {"name": "Zara", "logo_url": "/brands/zara.png", "description": "Zara SA is a Spanish multi-national retail clothing chain specializing in fast fashion."},
        {"name": "Ralph Lauren", "logo_url": "/brands/ralphlauren.png", "description": "Ralph Lauren Corporation is a global leader in premium lifestyle products."},
        {"name": "Zudio", "logo_url": "/brands/zudio.png", "description": "Zudio is a popular Indian fast fashion retail brand under Tata Trent."},
        {"name": "Trends", "logo_url": "/brands/trends.png", "description": "Trends is Reliance Retail's apparel and accessories specialty format store."},
        {"name": "Meesho", "logo_url": "/brands/meesho.png", "description": "Meesho is an Indian social e-commerce platform offering budget lifestyle products."},
        {"name": "Myntra", "logo_url": "/brands/myntra.png", "description": "Myntra is a major Indian fashion e-commerce company."},
        {"name": "Amazon", "logo_url": "/brands/amazon.png", "description": "Amazon Brand offers premium and high-value everyday clothing wear."},
        {"name": "Flipkart", "logo_url": "/brands/flipkart.png", "description": "Flipkart Brand provides high quality budget-friendly fashion collections."}
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
        },
        {
            "title": "Zudio Casual V-Neck T-Shirt",
            "description": "Breathable, lightweight 100% combed cotton V-neck t-shirt. Tailored for comfort and everyday casual wear.",
            "gender": "men",
            "brand": "Zudio",
            "category": "hoodies-sweatshirts",
            "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
            "color": "White",
            "size": "Medium",
            "rating": 4.1,
            "reviews_count": 340,
            "base_original_price": 1.80,
        },
        {
            "title": "Meesho Floral Printed Rayon Anarkali Kurta",
            "description": "Elegant ethnic flared kurta featuring classic floral motifs. Stitched in lightweight, flowy rayon fabric for absolute ease and style.",
            "gender": "women",
            "brand": "Meesho",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
            "color": "Pink",
            "size": "Small",
            "rating": 4.3,
            "reviews_count": 520,
            "base_original_price": 3.60,
        },
        {
            "title": "Trends Slim Fit Solid Stretch Chinos",
            "description": "High-grade stretchable cotton blend trousers. Equipped with side pockets, back welt pockets, and a button-zip fastening.",
            "gender": "men",
            "brand": "Trends",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop&q=80",
            "color": "Beige",
            "size": "32",
            "rating": 4.0,
            "reviews_count": 210,
            "base_original_price": 7.20,
        },
        {
            "title": "Myntra Roadster Faux Leather Biker Jacket",
            "description": "High durability polyurethane leather jacket. Tailored with asymmetry zip closure, lapel collars, and zippered hand pockets.",
            "gender": "men",
            "brand": "Myntra",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
            "color": "Black",
            "size": "Large",
            "rating": 4.5,
            "reviews_count": 145,
            "base_original_price": 18.00,
        },
        {
            "title": "Amazon Brand Symbol Regular Fit Polo Tee",
            "description": "Classic pique knit polo shirt featuring a ribbed collar and double-button placket. Crafted from premium breathable cotton.",
            "gender": "men",
            "brand": "Amazon",
            "category": "hoodies-sweatshirts",
            "image_url": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
            "color": "Navy Blue",
            "size": "Medium",
            "rating": 4.2,
            "reviews_count": 890,
            "base_original_price": 4.80,
        },
        {
            "title": "Flipkart SmartBuy Cushion Running Shoes",
            "description": "Lightweight breathable mesh athletic shoes. Offers high shock absorption and slip-resistant sole grip for morning workouts.",
            "gender": "unisex",
            "brand": "Flipkart",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            "color": "Red/Black",
            "size": "US 8",
            "rating": 4.0,
            "reviews_count": 1120,
            "base_original_price": 3.60,
        },
        {
            "title": "Zudio Floral Print A-Line Midi Dress",
            "description": "Sleeveless square-neck A-line dress in a soft floral georgette fabric. Designed with tier details and back zip closure.",
            "gender": "women",
            "brand": "Zudio",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
            "color": "Yellow Floral",
            "size": "Small",
            "rating": 4.2,
            "reviews_count": 185,
            "base_original_price": 6.00,
        },
        {
            "title": "Trends Patterned Knit Woolen Cardigan",
            "description": "Soft button-up long sleeve cardigan with micro-knit patterns. Made in warm cozy acrylic wool blend.",
            "gender": "women",
            "brand": "Trends",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
            "color": "Grey",
            "size": "Medium",
            "rating": 4.3,
            "reviews_count": 94,
            "base_original_price": 9.60,
        },
        {
            "title": "Meesho Banarasi Silk Saree",
            "description": "Classic festive Banarasi art silk saree decorated with rich zari border patterns. Comes with an unstitched matching blouse piece.",
            "gender": "women",
            "brand": "Meesho",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
            "color": "Royal Blue/Gold",
            "size": "Free Size",
            "rating": 4.4,
            "reviews_count": 670,
            "base_original_price": 5.40,
        },
        {
            "title": "Myntra Mast & Harbour Chronograph Watch",
            "description": "Analogue watch with clean chronograph dials. Fitted with a premium tan leather strap and water-resistant steel bezel casing.",
            "gender": "men",
            "brand": "Myntra",
            "category": "watches",
            "image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80",
            "color": "Tan/Silver",
            "size": "One Size",
            "rating": 4.6,
            "reviews_count": 310,
            "base_original_price": 15.00,
        },
        {
            "title": "Zara Wide-Leg Flowy Trousers",
            "description": "High-waist trousers featuring front pleat detailing, side pockets, and false welt pockets on the back. Front zip and hook fastening.",
            "gender": "women",
            "brand": "Zara",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
            "color": "Emerald Green",
            "size": "Medium",
            "rating": 4.4,
            "reviews_count": 128,
            "base_original_price": 27.40,
        },
        {
            "title": "Zara Cropped Blue Denim Jacket",
            "description": "Cropped collared jacket made of rigid cotton denim. Long sleeves with cuffs. Front button flap patch pockets and welt pockets.",
            "gender": "women",
            "brand": "Zara",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
            "color": "Light Blue Denim",
            "size": "Medium",
            "rating": 4.5,
            "reviews_count": 215,
            "base_original_price": 35.80,
        },
        # 1. Amazon
        {
            "title": "Amazon Brand Symbol Slim Fit Blazer Suit",
            "description": "Premium quality slim fit blazer suit tailored for formal occasions and celebrations.",
            "gender": "men",
            "brand": "Amazon",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&auto=format&fit=crop&q=80",
            "color": "Charcoal Black",
            "size": "L",
            "rating": 4.3,
            "reviews_count": 142,
            "base_original_price": 42.00,
        },
        {
            "title": "Amazon Brand Inkast Denim Trucker Jacket",
            "description": "Classic rigid cotton denim trucker jacket with button closures and signature chest pockets.",
            "gender": "men",
            "brand": "Amazon",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80",
            "color": "Classic Indigo",
            "size": "M",
            "rating": 4.4,
            "reviews_count": 98,
            "base_original_price": 21.50,
        },
        {
            "title": "Amazon Brand Solimo Leather Chelsea Boots",
            "description": "Premium leather Chelsea boots featuring elasticated side panels and pull loops for modern comfort.",
            "gender": "men",
            "brand": "Amazon",
            "category": "boots",
            "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80",
            "color": "Dark Brown",
            "size": "9",
            "rating": 4.1,
            "reviews_count": 56,
            "base_original_price": 30.00,
        },
        {
            "title": "Amazon Brand Symbol Premium Cotton Hoodie",
            "description": "Ultra soft fleece-lined pullover hoodie with kangaroo pockets and adjustable drawstrings.",
            "gender": "unisex",
            "brand": "Amazon",
            "category": "hoodies-sweatshirts",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
            "color": "Olive Green",
            "size": "M",
            "rating": 4.5,
            "reviews_count": 210,
            "base_original_price": 14.50,
        },
        # 2. Flipkart
        {
            "title": "Flipkart Brand Peter England Slim Fit Blazer",
            "description": "Elegant smart-casual single-breasted blazer with notch lapels, button closures, and front flap pockets.",
            "gender": "men",
            "brand": "Flipkart",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600&auto=format&fit=crop&q=80",
            "color": "Navy Blue",
            "size": "40R",
            "rating": 4.2,
            "reviews_count": 138,
            "base_original_price": 50.00,
        },
        {
            "title": "Flipkart Brand Provogue Leather Formal Shoes",
            "description": "Classic oxford dress shoes crafted in polished genuine leather with secure lace-up details.",
            "gender": "men",
            "brand": "Flipkart",
            "category": "boots",
            "image_url": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80",
            "color": "Black",
            "size": "8",
            "rating": 4.0,
            "reviews_count": 88,
            "base_original_price": 22.80,
        },
        {
            "title": "Flipkart Brand Metronaut Windbreaker Jacket",
            "description": "High performance water-resistant windbreaker jacket featuring a full zip front and hood details.",
            "gender": "unisex",
            "brand": "Flipkart",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
            "color": "Neon Yellow/Black",
            "size": "L",
            "rating": 4.3,
            "reviews_count": 167,
            "base_original_price": 18.00,
        },
        {
            "title": "Flipkart Brand Roadster Graphic Crewneck Sweatshirt",
            "description": "Comfortable long sleeve crewneck sweatshirt featuring a premium printed front logo design.",
            "gender": "unisex",
            "brand": "Flipkart",
            "category": "hoodies-sweatshirts",
            "image_url": "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&auto=format&fit=crop&q=80",
            "color": "Heather Grey",
            "size": "M",
            "rating": 4.1,
            "reviews_count": 320,
            "base_original_price": 12.00,
        },
        # 3. Meesho
        {
            "title": "Meesho Designer Festive Kurta Pajama Set",
            "description": "Traditional art silk ethnic wear kurta pajama set decorated with detailed embroidery work.",
            "gender": "men",
            "brand": "Meesho",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
            "color": "Maroon/Gold",
            "size": "L",
            "rating": 4.4,
            "reviews_count": 510,
            "base_original_price": 14.50,
        },
        {
            "title": "Meesho Stylish Embroidered Anarkali Gown",
            "description": "Heavy designer georgette embroidered Anarkali gown with matching dupatta set.",
            "gender": "women",
            "brand": "Meesho",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
            "color": "Teal Blue",
            "size": "M",
            "rating": 4.3,
            "reviews_count": 412,
            "base_original_price": 18.00,
        },
        {
            "title": "Meesho Casual Canvas Walking Sneakers",
            "description": "Lightweight breathable canvas shoes built for casual daily wear and walk comfort.",
            "gender": "unisex",
            "brand": "Meesho",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1525966222434-6ad5334a415e?w=600&auto=format&fit=crop&q=80",
            "color": "Red/White",
            "size": "7",
            "rating": 4.1,
            "reviews_count": 189,
            "base_original_price": 8.40,
        },
        {
            "title": "Meesho Embroidered Velvet Shawl & Cardigan",
            "description": "Rich velvet winter outerwear cardigan featuring detailed golden thread borders.",
            "gender": "women",
            "brand": "Meesho",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
            "color": "Deep Wine",
            "size": "Free Size",
            "rating": 4.2,
            "reviews_count": 78,
            "base_original_price": 10.80,
        },
        # 4. Myntra
        {
            "title": "Myntra HRX Activewear Running Sneakers",
            "description": "High rebound running sneakers equipped with air cushioning and TPU heel counter for running stability.",
            "gender": "unisex",
            "brand": "Myntra",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
            "color": "Volt Green/Black",
            "size": "9",
            "rating": 4.6,
            "reviews_count": 890,
            "base_original_price": 36.00,
        },
        {
            "title": "Myntra Roadster Classic Leather Jacket",
            "description": "High-grade premium polyurethane biker leather jacket with asymmetric zip and metallic buckle belts.",
            "gender": "men",
            "brand": "Myntra",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&auto=format&fit=crop&q=80",
            "color": "Vintage Brown",
            "size": "L",
            "rating": 4.5,
            "reviews_count": 278,
            "base_original_price": 60.00,
        },
        {
            "title": "Myntra Mast & Harbour Casual Checked Blazer",
            "description": "Modern checked blazer tailored in a premium cotton blend. Renders excellent smart casual vibes.",
            "gender": "men",
            "brand": "Myntra",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80",
            "color": "Windowpane Checked Grey",
            "size": "42R",
            "rating": 4.4,
            "reviews_count": 115,
            "base_original_price": 42.00,
        },
        {
            "title": "Myntra DressBerry Solid A-Line Midi Dress",
            "description": "Classy short sleeve A-line midi dress with comfortable cinched waistline details.",
            "gender": "women",
            "brand": "Myntra",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
            "color": "Ruby Red",
            "size": "S",
            "rating": 4.5,
            "reviews_count": 164,
            "base_original_price": 21.50,
        },
        # 5. Zudio
        {
            "title": "Zudio Denim Jacket with Sherpa Collar",
            "description": "Cozy and stylish denim jacket featuring a soft off-white Sherpa fleece collar lining.",
            "gender": "unisex",
            "brand": "Zudio",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
            "color": "Medium Wash Denim",
            "size": "M",
            "rating": 4.3,
            "reviews_count": 312,
            "base_original_price": 18.00,
        },
        {
            "title": "Zudio Modern Fit Linen Suit Blazer",
            "description": "Super lightweight and breathable linen suit blazer perfect for hot summer stylings.",
            "gender": "men",
            "brand": "Zudio",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
            "color": "Sandy Beige",
            "size": "L",
            "rating": 4.2,
            "reviews_count": 87,
            "base_original_price": 24.00,
        },
        {
            "title": "Zudio Classic White Casual Sneakers",
            "description": "Minimalist all-white daily wear court sneakers featuring durable synthetic uppers.",
            "gender": "unisex",
            "brand": "Zudio",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80",
            "color": "Clean White",
            "size": "8",
            "rating": 4.4,
            "reviews_count": 560,
            "base_original_price": 12.00,
        },
        {
            "title": "Zudio Tiered Cotton Sundress",
            "description": "Flowy tiered summer sundress made of 100% pure premium cotton.",
            "gender": "women",
            "brand": "Zudio",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
            "color": "Light Lavender",
            "size": "S",
            "rating": 4.3,
            "reviews_count": 215,
            "base_original_price": 10.80,
        },
        # 6. Zara
        {
            "title": "Zara Double-Breasted Wool Blazer",
            "description": "Premium tailored wool blazer with peak lapels, double-breasted button front, and gold-tone buttons.",
            "gender": "women",
            "brand": "Zara",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&auto=format&fit=crop&q=80",
            "color": "Pure White",
            "size": "M",
            "rating": 4.5,
            "reviews_count": 182,
            "base_original_price": 95.00,
        },
        {
            "title": "Zara Faux Leather Oversized Jacket",
            "description": "Oversized collared jacket with long sleeves, zip pockets, and adjustable belt at the waist.",
            "gender": "women",
            "brand": "Zara",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
            "color": "Vintage Black",
            "size": "S",
            "rating": 4.6,
            "reviews_count": 214,
            "base_original_price": 72.00,
        },
        {
            "title": "Zara Pointed Toe Ankle Leather Boots",
            "description": "Chic pointed toe ankle high boots in genuine leather, featuring side zip closure and blocks heels.",
            "gender": "women",
            "brand": "Zara",
            "category": "boots",
            "image_url": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80",
            "color": "Chestnut Brown",
            "size": "6",
            "rating": 4.4,
            "reviews_count": 119,
            "base_original_price": 108.00,
        },
        {
            "title": "Zara Pleated Satin Wrap Dress",
            "description": "Flowy wrap dress featuring a v-neckline, long sleeves, pleated shoulder and front wrap closure details.",
            "gender": "women",
            "brand": "Zara",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
            "color": "Emerald Green",
            "size": "S",
            "rating": 4.6,
            "reviews_count": 134,
            "base_original_price": 60.00,
        },
        # 7. Trends
        {
            "title": "Trends Netplay Cotton Casual Blazer",
            "description": "Smart unstructured casual blazer in light textured cotton, featuring patch pockets.",
            "gender": "men",
            "brand": "Trends",
            "category": "suits-blazers",
            "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
            "color": "Olive Drab",
            "size": "42",
            "rating": 4.1,
            "reviews_count": 182,
            "base_original_price": 36.00,
        },
        {
            "title": "Trends Performax Sports Running Shoes",
            "description": "High breathing mesh shoes equipped with flexible phylon sole for dynamic sports cushioning.",
            "gender": "unisex",
            "brand": "Trends",
            "category": "sneakers",
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            "color": "Blue/Cyan",
            "size": "9",
            "rating": 4.2,
            "reviews_count": 310,
            "base_original_price": 22.80,
        },
        {
            "title": "Trends Fig Floral Print Maxi Dress",
            "description": "Charming long sleeve tiered maxi dress decorated with gorgeous micro floral patterns.",
            "gender": "women",
            "brand": "Trends",
            "category": "dresses",
            "image_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80",
            "color": "Peach Floral",
            "size": "M",
            "rating": 4.3,
            "reviews_count": 128,
            "base_original_price": 18.00,
        },
        {
            "title": "Trends Avaasa Ethnic Long Jacket",
            "description": "Ethnic open-front longline jacket/shrug crafted with intricate block prints.",
            "gender": "women",
            "brand": "Trends",
            "category": "jackets-coats",
            "image_url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
            "color": "Deep Indigo Blue",
            "size": "L",
            "rating": 4.4,
            "reviews_count": 96,
            "base_original_price": 15.60,
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
            o_start = datetime.utcnow() - timedelta(days=random.randint(1, 2))
            o_end = datetime.utcnow() + timedelta(hours=random.randint(2, 36), minutes=random.randint(0, 59))
            p_price = ProductPrice(
                product_id=product.id,
                store_name=store,
                price=store_price,
                original_price=original_price,
                in_stock=in_stock,
                product_url=aff_url,
                affiliate_url=aff_url,
                offer_start=o_start,
                offer_end=o_end
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
