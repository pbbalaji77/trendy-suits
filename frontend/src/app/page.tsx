"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, TrendingUp, Award, ArrowRight, Percent, ArrowDown } from "lucide-react";
import { Product } from "@/types";
import { useCurrency } from "@/hooks/use-currency";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [trending, setTrending] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggested brands
  const brands = ["Gucci", "Prada", "Nike", "Balenciaga", "Rolex", "Zara", "Ralph Lauren"];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch trending
        const trendingRes = await fetch("http://localhost:8000/api/deals/trending?limit=4");
        const recsRes = await fetch("http://localhost:8000/api/deals/recommendations");
        const discountRes = await fetch("http://localhost:8000/api/products/?sort_by=deal_score&limit=12");

        if (trendingRes.ok) setTrending(await trendingRes.json());
        if (recsRes.ok) setRecommendations(await recsRes.json());
        if (discountRes.ok) setDiscounts(await discountRes.json());
      } catch (err) {
        console.warn("Could not fetch home data, loading offline fallback mock data...", err);
        // Load fallback mock data directly to guarantee visual excellence out of the box
        const mockProducts: Product[] = [
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
          }
        ];
        setTrending(mockProducts);
        setRecommendations(mockProducts.slice().reverse());
        setDiscounts(mockProducts.filter(p => p.deal_score > 80));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card-dark border border-white/10 px-6 py-20 sm:px-12 sm:py-28 text-center flex flex-col items-center justify-center bg-gradient-to-br from-luxury-black via-[#0D0D11] to-[#1A1125] shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl w-full space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 inline-flex items-center gap-1.5 uppercase tracking-wider mx-auto">
            <Sparkles size={12} /> AI-Powered Comparison Curation
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
            Discover Premium Fashion for the <span className="text-gradient-gold">Best Price</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Trendy Suits AI queries and cross-checks the leading boutique feeds in real-time. Instantly find where your favorite clothing is listed cheapest.
          </p>

          {/* Large Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg w-full mx-auto relative flex items-center group">
            <input
              type="text"
              placeholder="Search Alexander McQueen, Gucci bags, Yeezys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white text-sm sm:text-base focus:outline-none focus:border-luxury-gold hover:border-white/20 transition-all duration-300 shadow-luxury-glow/5 group-hover:shadow-luxury-glow/10"
            />
            <Search className="absolute left-4.5 text-neutral-400 group-focus-within:text-luxury-gold transition-colors" size={20} />
            <button
              type="submit"
              className="absolute right-2.5 h-9 px-6 rounded-full bg-luxury-gold hover:bg-white text-neutral-950 text-xs sm:text-sm font-semibold transition-colors duration-300"
            >
              Analyze
            </button>
          </form>
        </div>
      </section>

      {/* Featured Luxury Brands */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-900/50 pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Curated Boutiques & Brands
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/search?brand=${encodeURIComponent(brand)}`}
              className="px-4 py-3.5 rounded-2xl glass-card-light dark:glass-card-dark text-center border border-neutral-200 dark:border-neutral-800 hover:border-luxury-gold dark:hover:border-luxury-gold hover:shadow-luxury-glow/5 transition-all duration-300 font-serif font-semibold text-neutral-800 dark:text-neutral-200"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Fashion Deals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-900/50 pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-luxury-gold" /> Trending Deals
          </h2>
          <Link
            href="/deals"
            className="text-xs sm:text-sm text-neutral-500 hover:text-luxury-gold flex items-center gap-1 transition-colors"
          >
            Explore 100+ Deals <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-900 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* AI Curation & Recommendations */}
      <section className="rounded-3xl overflow-hidden glass-card-dark border border-white/5 bg-gradient-to-br from-[#0F0D15] via-neutral-950 to-luxury-black p-8 sm:p-12 relative shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-luxury-gold/5 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-white/10 pb-8 mb-8">
          <div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-1 w-fit mb-3">
              <Sparkles size={10} /> SMART RECOMMENDATIONS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI Style Curation for You
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-lg leading-relaxed">
              Based on your search interests and high-rated items, our engine recommends the following premium wardrobe updates.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-900 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Biggest Discounts Today */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-900/50 pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Percent size={22} className="text-luxury-gold" /> Biggest Discounts Today
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-900 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {discounts.map((product) => (
              <ProductCard key={product.id} product={product} showDiscountBadge={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Product Card Sub-Component
function ProductCard({ product, showDiscountBadge = false }: { product: Product; showDiscountBadge?: boolean }) {
  const { formatPrice } = useCurrency();
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 hover:border-luxury-gold/50 dark:hover:border-luxury-gold/50 transition-all duration-300 hover:shadow-luxury-glow/5 relative"
    >
      {/* Product Image */}
      <div className="h-60 relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[9px] font-bold text-white border border-white/10 uppercase tracking-wider">
            {product.brand.name}
          </span>
        </div>
        
        {/* AI Deal Score Badge */}
        <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-luxury-gold/30 text-[10px] font-bold text-luxury-gold flex items-center gap-1">
          <Sparkles size={10} /> Deal Score: {product.deal_score}
        </div>

        {showDiscountBadge && product.deal_score >= 85 && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded bg-luxury-gold text-neutral-950 text-[10px] font-bold flex items-center gap-0.5">
            <ArrowDown size={10} /> Max Sale
          </div>
        )}
      </div>

      {/* Info Body */}
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
  );
}
