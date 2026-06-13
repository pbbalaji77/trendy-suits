"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Sparkles, Heart, Bell, ShoppingBag, ShieldCheck, 
  ArrowRight, ExternalLink, Calendar, Plus, MessageSquarePlus, Star, X
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ProductDetail, Prediction, ProductPrice } from "@/types";
import AIChat from "@/components/ai-chat";
import { useCurrency } from "@/hooks/use-currency";

export default function ProductComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { config, formatPrice } = useCurrency();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (product) {
      const localWish = window.localStorage.getItem("wishlist");
      if (localWish) {
        try {
          const wishList = JSON.parse(localWish) as any[];
          setIsSaved(wishList.some(p => p.id === product.id));
        } catch {
          setIsSaved(false);
        }
      }
    }
  }, [product]);

  const handleRedirect = (e: React.MouseEvent, url: string) => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      e.preventDefault();
      alert("Please sign in or sign up to visit the store and buy products!");
      router.push("/dashboard");
    }
  };

  const handleAddToWardrobe = () => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      alert("Please sign in or sign up to add items to your wardrobe!");
      router.push("/dashboard");
      return;
    }

    if (!product) return;

    const localWish = window.localStorage.getItem("wishlist");
    let wishList: any[] = [];
    if (localWish) {
      try {
        wishList = JSON.parse(localWish);
      } catch {
        wishList = [];
      }
    }

    if (isSaved) {
      const updated = wishList.filter(p => p.id !== product.id);
      window.localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsSaved(false);
    } else {
      wishList.push({
        id: product.id,
        title: product.title,
        base_price: product.base_price,
        rating: product.rating,
        reviews_count: product.reviews_count,
        deal_score: product.deal_score,
        image_url: product.image_url,
        gender: product.gender,
        brand: product.brand,
        category: product.category
      });
      window.localStorage.setItem("wishlist", JSON.stringify(wishList));
      setIsSaved(true);
    }
  };

  // Price history timeframe (7d, 30d, 90d, 1y)
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  // Alert form state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Review form state
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      const fetchWithTimeout = async (url: string, timeout = 1200) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          return res;
        } catch (err) {
          clearTimeout(id);
          throw err;
        }
      };

      try {
        const prodRes = await fetchWithTimeout(`http://localhost:8000/api/products/${id}`);
        const predRes = await fetchWithTimeout(`http://localhost:8000/api/products/${id}/prediction`);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProduct(prodData);
        } else {
          setError(true);
        }

        if (predRes.ok) {
          setPrediction(await predRes.json());
        }
      } catch (err) {
        console.warn("Could not fetch product detail, using local mock data fallback.", err);
        // Load fallback mock detail for offline execution
        const mockDetail: ProductDetail = {
          id: Number(id),
          title: "Gucci GG Marmont Shoulder Bag",
          description: "The medium GG Marmont chain shoulder bag has a softly structured shape and an oversized flap closure with double G hardware. The sliding chain strap can be worn multiple ways, changing between a shoulder and a top handle bag.",
          gender: "women",
          rating: 4.8,
          reviews_count: 142,
          base_price: 1750.0,
          deal_score: 88,
          image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
          color: "Black",
          size: "Medium",
          brand: { id: 1, name: "Gucci", logo_url: "" },
          category: { id: 1, name: "Bags", slug: "bags-handbags" },
          prices: [
            { id: 1, product_id: 1, store_name: "Amazon", price: 1850.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 2, product_id: 1, store_name: "Flipkart", price: 1950.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 3, product_id: 1, store_name: "Myntra", price: 1750.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 4, product_id: 1, store_name: "Ajio", price: 1800.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 5, product_id: 1, store_name: "Tata Cliq", price: 2100.00, original_price: 2500.00, in_stock: false, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 6, product_id: 1, store_name: "Nykaa Fashion", price: 1820.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 7, product_id: 1, store_name: "Reliance Trends", price: 2200.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
            { id: 8, product_id: 1, store_name: "Shoppers Stop", price: 1900.00, original_price: 2500.00, in_stock: true, product_url: "#", affiliate_url: "", last_updated: "" },
          ],
          price_history: [
            { id: 1, store_name: "Myntra", price: 2100.00, recorded_at: "2026-05-15T00:00:00Z" },
            { id: 2, store_name: "Myntra", price: 2000.00, recorded_at: "2026-05-20T00:00:00Z" },
            { id: 3, store_name: "Myntra", price: 1900.00, recorded_at: "2026-05-25T00:00:00Z" },
            { id: 4, store_name: "Myntra", price: 1850.00, recorded_at: "2026-06-01T00:00:00Z" },
            { id: 5, store_name: "Myntra", price: 1750.00, recorded_at: "2026-06-12T00:00:00Z" },
          ],
          reviews: [
            { id: 1, product_id: 1, rating: 5, title: "Pure Elegance", comment: "The velvet chevron design is simply breathtaking. Got a great discount using Trendy Suits!", created_at: "2026-06-01T00:00:00Z", user: { email: "alice@example.com", full_name: "Alice Vance" } },
            { id: 2, product_id: 1, rating: 4, title: "Great Bag", comment: "High quality bag, matches all my formal dresses.", created_at: "2026-06-05T00:00:00Z", user: { email: "clara@example.com", full_name: "Clara Croft" } }
          ]
        };
        setProduct(mockDetail);
        setPrediction({
          current_price: 1750.0,
          predicted_trend: "down",
          confidence: 0.82,
          recommendation: "Optimal buy time - Price is at a historic low. Buy before stock runs out.",
          chart_data: [
            { day: "Jun 13", price: 1740 },
            { day: "Jun 14", price: 1730 },
            { day: "Jun 15", price: 1715 },
            { day: "Jun 16", price: 1720 },
            { day: "Jun 17", price: 1710 },
            { day: "Jun 18", price: 1700 }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-luxury-gold/20 border-t-luxury-gold animate-spin"></div>
        <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest animate-pulse">Analyzing store inventories...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Failed to load product details.</h2>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-luxury-gold text-neutral-900 font-bold rounded-full">
          Return Home
        </button>
      </div>
    );
  }

  // Savings computations
  const instockPrices = product.prices.filter(p => p.in_stock);
  const sortedPrices = instockPrices.length > 0 
    ? [...instockPrices].sort((a, b) => a.price - b.price)
    : [...product.prices].sort((a, b) => a.price - b.price);

  const bestStore = sortedPrices[0];
  const worstStore = sortedPrices[sortedPrices.length - 1];
  const savings = worstStore.price - bestStore.price;
  const differencePct = worstStore.price > 0 ? (savings / worstStore.price * 100) : 0;

  // Prepare price history chart data
  const chartPoints = product.price_history.map(h => ({
    date: new Date(h.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Price: h.price
  }));

  // Handle setting price alert
  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem("token");
    if (!token) {
      setAlertMessage("Please login to set price alerts.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/alerts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          target_price: parseFloat(alertTargetPrice)
        })
      });

      if (response.ok) {
        setAlertMessage("Price alert created successfully!");
        setAlertTargetPrice("");
        setTimeout(() => setShowAlertModal(false), 2000);
      } else {
        const err = await response.json();
        setAlertMessage(err.detail || "Failed to create alert.");
      }
    } catch {
      setAlertMessage("Could not connect to authentication server. Alert set simulated locally.");
      setTimeout(() => setShowAlertModal(false), 2000);
    }
  };

  // Handle review submission
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem("token");
    if (!token) {
      setReviewMessage("Please login to submit reviews.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReviewRating,
          title: newReviewTitle,
          comment: newReviewComment
        })
      });

      if (response.ok) {
        setReviewMessage("Review submitted! Refreshing catalog...");
        setNewReviewTitle("");
        setNewReviewComment("");
        // Reload detail
        const freshRes = await fetch(`http://localhost:8000/api/products/${id}`);
        if (freshRes.ok) setProduct(await freshRes.ok ? await freshRes.json() : product);
      } else {
        const err = await response.json();
        setReviewMessage(err.detail || "Failed to post review.");
      }
    } catch {
      setReviewMessage("Review submitted. Simulated successfully!");
    }
  };

  return (
    <div className="pb-20 space-y-12">
      {/* Product Banner & Purchase Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Image Gallery */}
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-950 aspect-square flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.title}
              className="object-cover w-full h-full"
            />
            {/* AI Deal Score Float Badge */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-neutral-950/80 backdrop-blur-md border border-luxury-gold/30 text-xs font-bold text-luxury-gold flex items-center gap-1.5">
              <Sparkles size={14} /> AI Deal Score: {product.deal_score}/100
            </div>
          </div>
        </div>

        {/* Right Column - Store Comparisons */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Breadcrumb info */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
              <span>{product.gender}</span>
              <span>•</span>
              <span>{product.category.name}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">
                {product.brand.name} Curation
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Ratings Header */}
            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="flex items-center text-luxury-gold">
                <span className="mr-1">{product.rating}</span>
                <span>★</span>
              </div>
              <span className="text-neutral-400">({product.reviews_count} Verified Reviews)</span>
              {product.color && <span className="text-neutral-400">Color: {product.color}</span>}
              {product.size && <span className="text-neutral-400">Size: {product.size}</span>}
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
              {product.description}
            </p>
          </div>

          {/* Quick Price Comparison Card */}
          <div className="rounded-2xl p-6 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-2 border-r border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Lowest Price</span>
                <span className="text-base font-bold text-green-500 font-serif block mt-1">
                  {formatPrice(bestStore.price)}
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">{bestStore.store_name}</span>
              </div>
              
              <div className="p-2 sm:border-r border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Highest Price</span>
                <span className="text-base font-bold text-neutral-800 dark:text-neutral-200 font-serif block mt-1">
                  {formatPrice(worstStore.price)}
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">{worstStore.store_name}</span>
              </div>

              <div className="p-2 border-r border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Saved Amount</span>
                <span className="text-base font-bold text-luxury-gold font-serif block mt-1">
                  {formatPrice(savings)}
                </span>
              </div>

              <div className="p-2">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Difference</span>
                <span className="text-base font-bold text-luxury-gold font-serif block mt-1">
                  {differencePct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={bestStore.product_url}
                onClick={(e) => handleRedirect(e, bestStore.product_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-12 rounded-xl bg-luxury-gold text-neutral-900 font-bold hover:bg-white transition-colors duration-300 flex items-center justify-center gap-1.5 text-sm"
              >
                <ShoppingBag size={16} /> Buy Now on {bestStore.store_name}
              </a>
              <button
                onClick={handleAddToWardrobe}
                className="px-4 h-12 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-luxury-gold hover:text-luxury-gold bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 transition-colors duration-300 flex items-center justify-center gap-1.5"
              >
                <Heart size={16} className={isSaved ? "fill-red-500 text-red-500" : ""} /> 
                {isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => {
                  const token = window.localStorage.getItem("token");
                  if (!token) {
                    alert("Please sign in or sign up to set price alerts!");
                    router.push("/dashboard");
                    return;
                  }
                  setShowAlertModal(true);
                }}
                className="px-4 h-12 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-luxury-gold hover:text-luxury-gold bg-transparent text-sm font-bold text-neutral-800 dark:text-neutral-200 transition-colors duration-300 flex items-center justify-center gap-1.5"
              >
                <Bell size={16} /> Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Comparison Table */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          Compare Prices Across E-Commerce Stores
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-900">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Retailer</th>
                <th className="p-4 text-center">Availability</th>
                <th className="p-4">Original Price</th>
                <th className="p-4 text-right">Offer Price</th>
                <th className="p-4 text-right">Redirect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50 bg-white dark:bg-black">
              {product.prices.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200">{p.store_name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${p.in_stock ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                      {p.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400 line-through">{formatPrice(p.original_price)}</td>
                  <td className="p-4 text-right font-serif font-bold text-neutral-900 dark:text-white">{formatPrice(p.price)}</td>
                  <td className="p-4 text-right">
                    <a
                      href={p.product_url}
                      onClick={(e) => handleRedirect(e, p.product_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-luxury-gold hover:text-luxury-gold transition-colors duration-300 inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      Visit Store <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Price Prediction & History Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: AI Prediction Card */}
        {prediction && (
          <div className="rounded-2xl p-6 glass-card-dark border border-white/5 bg-gradient-to-br from-[#0F0D15] via-neutral-950 to-luxury-black flex flex-col justify-between gap-6 shadow-xl">
            <div className="space-y-4">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-0.5 w-fit">
                <Sparkles size={8} /> PREDICTION ENGINE
              </span>
              <h3 className="font-serif text-lg font-bold text-white">Should You Buy Now?</h3>
              
              <div className="flex items-center justify-between border-y border-white/5 py-4">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">Projected Trend</span>
                  <span className="text-xl font-bold uppercase tracking-wider text-luxury-gold mt-1 block">
                    {prediction.predicted_trend === "down" ? "📉 Falling" : prediction.predicted_trend === "up" ? "📈 Rising" : "➡️ Stable"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">AI Confidence</span>
                  <span className="text-xl font-bold text-white mt-1 block">{(prediction.confidence*100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-300 leading-relaxed">
                <strong>Verdict</strong>: {prediction.recommendation}
              </div>
            </div>
            
            <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-luxury-gold" />
              Machine learning models analyze historical retail updates.
            </div>
          </div>
        )}

        {/* Right: Price History Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Price Curation History</h3>
            <div className="flex gap-1">
              {(["7d", "30d", "90d", "1y"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-300 ${timeframe === t ? "bg-luxury-gold text-neutral-950 font-bold" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 h-60 min-h-60 w-full mt-4">
            {chartPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222225" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} domain={["auto", "auto"]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#aaa", fontSize: "11px" }}
                    itemStyle={{ color: "#D4AF37", fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Line type="monotone" dataKey="Price" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 4, stroke: "#111" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Insufficient price history recorded to plot.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submit Review Form */}
        <div className="rounded-2xl p-6 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-4">
          <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <MessageSquarePlus size={18} className="text-luxury-gold" /> Write a Review
          </h3>
          
          <form onSubmit={handlePostReview} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="text-neutral-300 dark:text-neutral-700 hover:scale-110 transition-transform"
                  >
                    <Star size={20} className={star <= newReviewRating ? "text-luxury-gold fill-luxury-gold" : ""} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Review Heading</label>
              <input
                type="text"
                placeholder="Amazing Quality!"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Comment</label>
              <textarea
                placeholder="Share your experience comparing this product..."
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
                required
              ></textarea>
            </div>

            {reviewMessage && (
              <p className="text-xs font-semibold text-luxury-gold">{reviewMessage}</p>
            )}

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-luxury-gold dark:hover:bg-luxury-gold dark:hover:text-white transition-colors"
            >
              Post Curation Review
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
            Customer Reviews ({product.reviews.length})
          </h3>
          
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {product.reviews.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-6">No reviews posted yet. Be the first to review this comparison deal!</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-900/50 bg-white/30 dark:bg-black/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{r.user.full_name}</span>
                    <span className="text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 text-xs text-luxury-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className={i < r.rating ? "fill-luxury-gold" : "text-neutral-600"} />
                    ))}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">{r.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Set Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl glass-card-dark border border-white/10 p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <Bell size={16} className="text-luxury-gold" /> Set Price Drop Alert
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              We will email you immediately when the matching store price of **{product.title}** drops below your target price.
            </p>

            <form onSubmit={handleSetAlert} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Target Price ({config.symbol})</label>
                <input
                  type="number"
                  placeholder={`Current base: ${formatPrice(product.base_price)}`}
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none focus:border-luxury-gold text-white"
                  required
                />
              </div>

              {alertMessage && (
                <p className="text-xs font-semibold text-luxury-gold">{alertMessage}</p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-luxury-gold text-neutral-900 text-xs font-bold hover:bg-white transition-colors"
              >
                Create Alert Curation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating chatbot handles product context */}
      <AIChat productId={product.id} productTitle={product.title} />
    </div>
  );
}
