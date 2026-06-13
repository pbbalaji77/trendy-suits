"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Percent, Tag, Flame, ShieldAlert, ArrowDown } from "lucide-react";
import { Product } from "@/types";
import { useCurrency } from "@/hooks/use-currency";
import { API_BASE_URL } from "@/config";

export default function DealsPage() {
  const { formatPrice } = useCurrency();
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "flash" | "discounts" | "luxury">("all");

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      try {
        let endpoint = `${API_BASE_URL}/api/deals/trending?limit=16`;
        if (activeTab === "discounts") {
          endpoint = `${API_BASE_URL}/api/products/?sort_by=deal_score&limit=16`;
        }
        
        const response = await fetch(endpoint);
        if (response.ok) {
          setDeals(await response.json());
        } else {
          throw new Error();
        }
      } catch (err) {
        console.warn("Could not fetch deals from API, using offline mock database fallback.", err);
        // Fallback mock items
        const mockFallback: Product[] = [
          {
            id: 1,
            title: "Gucci GG Marmont Shoulder Bag",
            base_price: 1750.0,
            rating: 4.8,
            reviews_count: 142,
            deal_score: 88,
            image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
            gender: "women",
            brand: { id: 1, name: "Gucci", logo_url: "" },
            category: { id: 1, name: "Bags", slug: "bags-handbags" }
          },
          {
            id: 2,
            title: "Nike Air Force 1 '07 Premium",
            base_price: 91.0,
            rating: 4.6,
            reviews_count: 820,
            deal_score: 92,
            image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
            gender: "unisex",
            brand: { id: 2, name: "Nike", logo_url: "" },
            category: { id: 2, name: "Sneakers", slug: "sneakers" }
          },
          {
            id: 3,
            title: "Rolex Submariner Date 41mm",
            base_price: 12800.0,
            rating: 4.9,
            reviews_count: 310,
            deal_score: 75,
            image_url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80",
            gender: "men",
            brand: { id: 3, name: "Rolex", logo_url: "" },
            category: { id: 3, name: "Watches", slug: "watches" }
          },
          {
            id: 4,
            title: "Prada Re-Edition Nylon Bag",
            base_price: 1450.0,
            rating: 4.7,
            reviews_count: 96,
            deal_score: 84,
            image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
            gender: "women",
            brand: { id: 4, name: "Prada", logo_url: "" },
            category: { id: 4, name: "Bags", slug: "bags-handbags" }
          },
          {
            id: 5,
            title: "Balenciaga Triple S Sneakers",
            base_price: 780.0,
            rating: 4.4,
            reviews_count: 215,
            deal_score: 80,
            image_url: "https://images.unsplash.com/photo-1512374382149-4332c6c02150?w=600&auto=format&fit=crop&q=80",
            gender: "unisex",
            brand: { id: 5, name: "Balenciaga", logo_url: "" },
            category: { id: 5, name: "Sneakers", slug: "sneakers" }
          },
          {
            id: 6,
            title: "Zara Wool Blend Oversized Coat",
            base_price: 119.0,
            rating: 4.2,
            reviews_count: 78,
            deal_score: 83,
            image_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
            gender: "women",
            brand: { id: 6, name: "Zara", logo_url: "" },
            category: { id: 6, name: "Jackets", slug: "jackets-coats" }
          }
        ];
        
        let filtered = [...mockFallback];
        if (activeTab === "flash") {
          filtered = filtered.filter(p => p.deal_score >= 85);
        } else if (activeTab === "luxury") {
          filtered = filtered.filter(p => p.base_price >= 500);
        }
        setDeals(filtered);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, [activeTab]);

  return (
    <div className="pb-20 space-y-10">
      {/* Banner */}
      <section className="relative rounded-3xl overflow-hidden glass-card-dark border border-white/5 p-8 sm:p-12 bg-gradient-to-br from-[#120F1C] via-black to-[#0A090D] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-4 text-center sm:text-left">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-1 w-fit mx-auto sm:mx-0">
            <Percent size={10} /> MAX VALUE PROMOTIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Exclusive Luxury Sales
          </h1>
          <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
            Acquire designer wardrobe staples with real-time monitored pricing drop alerts. Hand-picked options curated by our neural engines.
          </p>
        </div>
        
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4 text-center">
          <div>
            <span className="text-2xl font-serif font-bold text-luxury-gold">100+</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">Active Deals</span>
          </div>
          <div className="w-[1.5px] bg-white/10"></div>
          <div>
            <span className="text-2xl font-serif font-bold text-luxury-gold">35%</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-0.5">Max Savings</span>
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-900 overflow-x-auto gap-2">
        {[
          { id: "all", name: "All Offers", icon: <Tag size={14} /> },
          { id: "flash", name: "Flash Deals", icon: <Flame size={14} className="text-orange-500" /> },
          { id: "discounts", name: "Highest Discounts", icon: <Percent size={14} /> },
          { id: "luxury", name: "Luxury Sale", icon: <Sparkles size={14} className="text-luxury-gold" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-b-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "border-luxury-gold text-luxury-gold"
                : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-900 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {deals.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 hover:border-luxury-gold/50 dark:hover:border-luxury-gold/50 transition-all duration-300 hover:shadow-luxury-glow/5 relative"
            >
              <div className="h-60 relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-white border border-white/10 uppercase tracking-wider">
                    {product.brand.name}
                  </span>
                </div>
                
                <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-luxury-gold/30 text-[10px] font-bold text-luxury-gold flex items-center gap-1">
                  <Sparkles size={10} /> Deal Score: {product.deal_score}
                </div>

                {product.deal_score >= 88 && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-luxury-gold text-neutral-950 text-[10px] font-bold flex items-center gap-0.5">
                    <ArrowDown size={10} /> Hot Deal
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-wide text-neutral-800 dark:text-neutral-100 group-hover:text-luxury-gold transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                    {product.gender} • {product.category.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 uppercase tracking-widest leading-none">Best Price</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                      {formatPrice(product.base_price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs font-semibold text-luxury-gold">
                    <span>{product.rating} ★</span>
                    <span className="text-[9px] text-neutral-500 font-normal">({product.reviews_count})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
