import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Product, ProductPrice, PriceHistory, Brand, Category

class AIService:
    
    @staticmethod
    def calculate_deal_score(prices: List[ProductPrice], rating: float, reviews_count: int) -> int:
        """
        Calculate an AI Deal Score out of 100 based on:
        - Discount percentage (max weights)
        - Average rating
        - Review volume
        - Current stock
        """
        if not prices:
            return 50
        
        # Get the best deal (lowest price vs original price)
        best_price_entry = min(prices, key=lambda p: p.price)
        lowest_price = best_price_entry.price
        original_price = best_price_entry.original_price
        
        discount_pct = 0.0
        if original_price > 0:
            discount_pct = (original_price - lowest_price) / original_price
            
        # 1. Discount Factor (50 points max)
        # 0% discount = 15 points, 50%+ discount = 50 points
        discount_score = 15 + (discount_pct * 70)
        discount_score = min(50, max(0, discount_score))
        
        # 2. Rating Factor (30 points max)
        # 0.0 rating = 0 points, 5.0 rating = 30 points
        rating_score = (rating / 5.0) * 30
        
        # 3. Popularity/Review Volume Factor (20 points max)
        # 0 reviews = 0 points, 500+ reviews = 20 points
        review_score = min(20, math.log1p(reviews_count) / math.log1p(500) * 20)
        
        total_score = discount_score + rating_score + review_score
        
        # Adjust if out of stock
        if not best_price_entry.in_stock:
            total_score -= 15
            
        return int(min(100, max(10, total_score)))

    @staticmethod
    def predict_price(product: Product, db: Session) -> Dict[str, Any]:
        """
        Use price history to predict if the price will rise, fall, or stay stable.
        Returns prediction, confidence, recommendation, and projected chart data.
        """
        history = db.query(PriceHistory).filter(PriceHistory.product_id == product.id).order_by(PriceHistory.recorded_at.asc()).all()
        
        current_price = product.base_price
        
        if len(history) < 2:
            # Fallback when no enough history
            trend = "stable"
            confidence = 0.5
            recommendation = "Optimal buy time - Price is stable."
            # Generate simulated projection
            projection = []
            for i in range(1, 8):
                day = (datetime.utcnow() + timedelta(days=i)).strftime("%b %d")
                projection.append({"day": day, "price": current_price})
            return {
                "current_price": current_price,
                "predicted_trend": trend,
                "confidence": confidence,
                "recommendation": recommendation,
                "chart_data": projection
            }

        # Extract dates and prices
        prices_list = [h.price for h in history]
        
        # Simple linear regression trend
        n = len(prices_list)
        x = list(range(n))
        y = prices_list
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xx = sum(i*i for i in x)
        sum_xy = sum(x[i]*y[i] for i in range(n))
        
        denom = (n * sum_xx - sum_x * sum_x)
        if denom == 0:
            slope = 0
        else:
            slope = (n * sum_xy - sum_x * sum_y) / denom
            
        # Determine trend
        avg_price = sum_y / n
        price_diff_pct = (current_price - avg_price) / avg_price if avg_price > 0 else 0
        
        if slope < -0.1:
            trend = "down"
            confidence = min(0.95, 0.6 + abs(slope) / 100)
            if price_diff_pct < -0.05:
                recommendation = "Buy Now! Price is at a historic low and stabilizing."
            else:
                recommendation = "Wait for Drop. Price is currently dropping. Better deal expected in 3-5 days."
        elif slope > 0.1:
            trend = "up"
            confidence = min(0.95, 0.6 + slope / 100)
            if price_diff_pct > 0.05:
                recommendation = "Wait for Drop. Price is temporarily spiked. Watch for upcoming deals."
            else:
                recommendation = "High Demand - Buy Fast! Price is trending upwards. Purchase before it increases."
        else:
            trend = "stable"
            confidence = 0.85
            recommendation = "Buy Now! Price is highly stable at a discounted rate."

        # Generate 7-day projected price chart
        projection = []
        for i in range(1, 8):
            day = (datetime.utcnow() + timedelta(days=i)).strftime("%b %d")
            # Projected price = last price + slope * step + slight random noise
            projected = current_price + (slope * i) + random.uniform(-current_price*0.01, current_price*0.01)
            projected = max(original_price_fallback := (current_price * 0.5), round(projected, 2))
            projection.append({"day": day, "price": projected})
            
        return {
            "current_price": current_price,
            "predicted_trend": trend,
            "confidence": round(confidence, 2),
            "recommendation": recommendation,
            "chart_data": projection
        }

    @staticmethod
    def get_shopping_assistant_reply(product: Product, db: Session, user_message: str) -> str:
        """
        Core logic of AI Chatbot assistant for a specific product.
        Analyzes the query and extracts key details about prices, worthiness, and alternatives.
        """
        user_message_lower = user_message.lower()
        
        # Fetch prices and compare
        prices = db.query(ProductPrice).filter(ProductPrice.product_id == product.id).all()
        if not prices:
            return "I couldn't find any pricing details for this product right now."
            
        # Sort prices to get lowest and highest
        sorted_prices = sorted(prices, key=lambda p: p.price)
        best_deal = sorted_prices[0]
        worst_deal = sorted_prices[-1]
        savings = worst_deal.price - best_deal.price
        savings_pct = (savings / worst_deal.price * 100) if worst_deal.price > 0 else 0
        
        # 1. Price comparison intent
        if any(w in user_message_lower for w in ["lowest", "cheapest", "where to buy", "price comparison", "which website"]):
            reply = f"The lowest price for **{product.title}** is currently on **{best_deal.store_name}** at **${best_deal.price:,.2f}**. \n\n"
            reply += "Here is the price comparison table:\n"
            for p in sorted_prices:
                stock_status = "In Stock" if p.in_stock else "Out of Stock"
                reply += f"- **{p.store_name}**: ${p.price:,.2f} ({stock_status})\n"
            
            if savings > 0:
                reply += f"\nBy purchasing from **{best_deal.store_name}** instead of **{worst_deal.store_name}** (${worst_deal.price:,.2f}), you will save **${savings:,.2f}** ({savings_pct:.1f}% off)!"
            return reply

        # 2. Worth buying / review analysis intent
        elif any(w in user_message_lower for w in ["worth buying", "should i buy", "deal score", "is it good", "review", "worth it"]):
            trend_info = AIService.predict_price(product, db)
            reply = f"This product has an AI Deal Score of **{product.deal_score}/100**, which indicates a "
            
            if product.deal_score >= 80:
                reply += "**Highly Recommended** buy! "
            elif product.deal_score >= 60:
                reply += "**Good Value** purchase. "
            else:
                reply += "**Average Value** deal. "
                
            reply += f"\n\n- **Current Rating**: {product.rating} ★ based on {product.reviews_count} reviews.\n"
            reply += f"- **Price Prediction**: {trend_info['recommendation']}\n"
            
            if product.deal_score >= 75:
                reply += f"\n**Verdict**: Yes, it's definitely worth buying. The discount is generous and buyer ratings are strong."
            else:
                reply += f"\n**Verdict**: You might want to wait for a price drop or check alternatives below. The current discount is moderate."
            return reply

        # 3. Alternatives intent
        elif any(w in user_message_lower for w in ["alternative", "similar", "other choices", "other options", "like this"]):
            alternatives = db.query(Product).filter(
                Product.category_id == product.category_id,
                Product.id != product.id
            ).limit(3).all()
            
            if not alternatives:
                return f"Currently, I couldn't find any direct alternatives in the **{product.category.name}** category."
                
            reply = f"Here are the top alternatives to **{product.title}**:\n\n"
            for alt in alternatives:
                reply += f"1. **{alt.title}** by {alt.brand.name} - **${alt.base_price:,.2f}** ({alt.rating} ★, Deal Score: {alt.deal_score}/100)\n"
            reply += "\nThese items share similar features and styles, and might be worth exploring!"
            return reply

        # 4. Price trend / future price intent
        elif any(w in user_message_lower for w in ["future price", "prediction", "will price increase", "will price drop", "when to buy", "price history"]):
            trend_info = AIService.predict_price(product, db)
            trend_icon = "📈" if trend_info["predicted_trend"] == "up" else "📉" if trend_info["predicted_trend"] == "down" else "➡️"
            
            reply = f"Our Price Prediction AI anticipates that the price is **{trend_info['predicted_trend'].upper()}** {trend_icon} (Confidence: {trend_info['confidence']*100:.0f}%).\n\n"
            reply += f"**AI Recommendation**: {trend_info['recommendation']}\n\n"
            reply += "Price trends show regular fluctuations. You can check the price history chart on the product page to see the exact pattern."
            return reply

        # 5. Default generic reply
        else:
            reply = f"Hello! I am your AI Shopping Assistant for **{product.title}** by **{product.brand.name}**.\n\n"
            reply += "You can ask me questions like:\n"
            reply += "- *Which website has the lowest price?*\n"
            reply += "- *Is this product worth buying?*\n"
            reply += "- *Are there any good alternatives?*\n"
            reply += "- *What is the price prediction for next week?*\n\n"
            reply += f"Currently, the best price is **${best_deal.price:,.2f}** on **{best_deal.store_name}**."
            return reply

    @staticmethod
    def get_recommendations(db: Session, user_search_history: List[str] = None, wishlist_ids: List[int] = None) -> List[Product]:
        """
        Recommend items based on user preferences.
        If no history, fall back to recommending high deal_score trending products.
        """
        # Fetch trending products with high deal score
        query = db.query(Product)
        
        # Filter by categories/brands in search history or wishlist
        interested_categories = []
        if wishlist_ids:
            wishlist_products = db.query(Product).filter(Product.id.in_(wishlist_ids)).all()
            interested_categories = [p.category_id for p in wishlist_products]
            
        if interested_categories:
            query = query.filter(Product.category_id.in_(interested_categories))
            
        # Order by highest deal score and rating
        recommendations = query.order_by(Product.deal_score.desc(), Product.rating.desc()).limit(8).all()
        
        # Fallback if too few recommendations
        if len(recommendations) < 4:
            recommendations = db.query(Product).order_by(Product.deal_score.desc(), Product.rating.desc()).limit(8).all()
            
        return recommendations
