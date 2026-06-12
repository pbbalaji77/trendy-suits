export interface Brand {
  id: number;
  name: string;
  logo_url: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
}

export interface ProductPrice {
  id: number;
  product_id: number;
  store_name: string;
  price: number;
  original_price: number;
  in_stock: boolean;
  product_url: string;
  affiliate_url: string;
  last_updated: string;
}

export interface PriceHistory {
  id: number;
  store_name: string;
  price: number;
  recorded_at: string;
}

export interface User {
  email: string;
  full_name: string;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  user: User;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  gender: string;
  rating: number;
  reviews_count: number;
  base_price: number;
  deal_score: number;
  image_url: string;
  color?: string;
  size?: string;
  brand: Brand;
  category: Category;
}

export interface ProductDetail extends Product {
  prices: ProductPrice[];
  price_history: PriceHistory[];
  reviews: Review[];
}

export interface Alert {
  id: number;
  product_id: number;
  target_price: number;
  is_active: boolean;
  created_at: string;
  product: Product;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Prediction {
  current_price: number;
  predicted_trend: "up" | "down" | "stable";
  confidence: number;
  recommendation: string;
  chart_data: { day: string; price: number }[];
}

export interface Analytics {
  total_users: number;
  total_products: number;
  total_alerts: number;
  total_affiliate_earnings: number;
  total_traffic: number;
  earnings_by_month: { name: string; earnings: number }[];
  traffic_by_store: { name: string; value: number }[];
  user_signups_by_day: { day: string; count: number }[];
}
