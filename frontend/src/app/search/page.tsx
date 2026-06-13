"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, Mic, Image as ImageIcon, Filter, Sparkles, X, 
  ChevronDown, RotateCcw, Volume2, MicOff, Info
} from "lucide-react";
import { Product } from "@/types";
import { useCurrency } from "@/hooks/use-currency";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const initialQ = searchParams.get("q") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);

  // Advanced features state
  const [isListening, setIsListening] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [detectedQuery, setDetectedQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const categoryOptions = [
    { name: "Jackets & Coats", slug: "jackets-coats" },
    { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts" },
    { name: "Sneakers", slug: "sneakers" },
    { name: "Bags & Handbags", slug: "bags-handbags" },
    { name: "Watches", slug: "watches" },
    { name: "Sunglasses", slug: "sunglasses" }
  ];

  // Brands list
  const brandOptions = ["Gucci", "Prada", "Nike", "Balenciaga", "Rolex", "Zara", "Ralph Lauren", "Zudio", "Trends", "Meesho", "Myntra", "Amazon", "Flipkart"];

  // Fetch suggestions
  useEffect(() => {
    if (query.trim().length > 1) {
      fetch(`http://localhost:8000/api/products/suggestions?q=${encodeURIComponent(query)}`)
        .then(res => {
          if (res.ok) return res.json();
          return [];
        })
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Main search fetch
  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:8000/api/products/?q=${encodeURIComponent(query)}`;
    
    if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
    if (selectedGender) url += `&gender=${encodeURIComponent(selectedGender)}`;
    if (maxPrice < 15000) url += `&max_price=${maxPrice}`;
    if (minRating > 0) url += `&min_rating=${minRating}`;
    if (minDiscount > 0) url += `&min_discount=${minDiscount}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    fetch(url, { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (!data || data.length === 0) {
          throw new Error();
        }
        setResults(data);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // Fallback mock search results if offline
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
        
        // Apply offline filters
        let filtered = [...mockFallback];
        if (selectedBrand) filtered = filtered.filter(p => p.brand.name.toLowerCase() === selectedBrand.toLowerCase());
        if (selectedCategory) filtered = filtered.filter(p => p.category.slug === selectedCategory);
        if (selectedGender) filtered = filtered.filter(p => p.gender === selectedGender);
        if (maxPrice) filtered = filtered.filter(p => p.base_price <= maxPrice);
        if (minRating) filtered = filtered.filter(p => p.rating >= minRating);
        
        setResults(filtered);
      })
      .finally(() => setLoading(false));
  }, [query, selectedBrand, selectedCategory, selectedGender, maxPrice, minRating, minDiscount]);

  // Voice Search (Browser API)
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search is not supported in this browser. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Simulated Image Search with filename keyword parsing & interactive confirmation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        
        // Parse filename for initial guess
        const filename = file.name.toLowerCase();
        let initialGuess = "Designer Dress"; // default
        
        if (filename.includes("suit") || filename.includes("blazer") || filename.includes("tuxedo") || filename.includes("formal")) {
          initialGuess = "Luxury Suit";
        } else if (filename.includes("dress") || filename.includes("gown") || filename.includes("frock") || filename.includes("sari") || filename.includes("saree") || filename.includes("lehenga")) {
          initialGuess = "Party Dress";
        } else if (filename.includes("coat") || filename.includes("jacket") || filename.includes("wool")) {
          initialGuess = "Oversized Coat";
        } else if (filename.includes("sneaker") || filename.includes("shoe") || filename.includes("footwear") || filename.includes("nike")) {
          initialGuess = "Nike Sneakers";
        } else if (filename.includes("bag") || filename.includes("handbag") || filename.includes("purse") || filename.includes("prada")) {
          initialGuess = "Prada Handbag";
        } else if (filename.includes("watch") || filename.includes("rolex")) {
          initialGuess = "Rolex Watch";
        } else if (filename.includes("glass") || filename.includes("sunglass")) {
          initialGuess = "Designer Sunglasses";
        } else if (filename.includes("shirt") || filename.includes("tshirt") || filename.includes("top")) {
          initialGuess = "Cotton T-Shirt";
        } else if (filename.includes("jean") || filename.includes("denim") || filename.includes("pant") || filename.includes("trouser")) {
          initialGuess = "Denim Jeans";
        }
        
        setDetectedQuery(initialGuess);
        setShowImageModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detectedQuery.trim()) {
      setLoading(true);
      setShowImageModal(false);
      
      // Map category dynamically
      const q_lower = detectedQuery.toLowerCase();
      let cat = "";
      if (anyKeyword(q_lower, ["shoe", "sneaker", "boot", "footwear", "nike", "adidas"])) cat = "sneakers";
      else if (anyKeyword(q_lower, ["bag", "handbag", "purse", "clutch", "wallet"])) cat = "bags-handbags";
      else if (q_lower.includes("watch")) cat = "watches";
      else if (anyKeyword(q_lower, ["glass", "sunglass", "shade"])) cat = "sunglasses";
      else if (anyKeyword(q_lower, ["suit", "blazer", "tuxedo", "formal"])) cat = "suits-blazers";
      else if (anyKeyword(q_lower, ["dress", "gown", "frock", "skirt", "sari", "saree", "lehenga"])) cat = "dresses";
      else if (anyKeyword(q_lower, ["coat", "jacket", "trench"])) cat = "jackets-coats";
      else if (anyKeyword(q_lower, ["hoodie", "sweatshirt", "sweater"])) cat = "hoodies-sweatshirts";
      
      setSelectedCategory(cat);
      setQuery(detectedQuery.trim());
    }
  };
  
  const anyKeyword = (str: string, keywords: string[]) => {
    return keywords.some(k => str.includes(k));
  };

  const clearImageSearch = () => {
    setImageFile(null);
    setImagePreview(null);
    setQuery("");
  };

  const handleResetFilters = () => {
    setSelectedGender("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMaxPrice(15000);
    setMinRating(0);
    setMinDiscount(0);
    setQuery("");
  };

  return (
    <div className="pb-16 space-y-8">
      {/* Search Header Container */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-2xl w-full mx-auto">
          {/* Main Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search garments, shoes, color, size, brands..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full h-12 pl-11 pr-24 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-sm focus:outline-none focus:border-luxury-gold dark:text-white"
            />
            <Search className="absolute left-4 text-neutral-400" size={16} />
            
            {/* Action buttons */}
            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${isListening ? "text-red-500 animate-pulse" : "text-neutral-400"}`}
                title="Voice Search"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Image Search"
              >
                <ImageIcon size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-13 left-0 right-0 z-30 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] shadow-lg overflow-hidden py-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => {
                    setQuery(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs sm:text-sm text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Image Preview Tag */}
        {imagePreview && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-luxury-gold/5 border border-luxury-gold/20 max-w-sm mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Search upload" className="h-10 w-10 object-cover rounded" />
            <div className="flex-1">
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Image uploaded</p>
              <p className="text-[10px] text-neutral-400">Simulating product image matching...</p>
            </div>
            <button onClick={clearImageSearch} className="p-1 text-neutral-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Filter & Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:border-r lg:border-neutral-200/50 lg:dark:border-neutral-900/50 lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Filter size={16} className="text-luxury-gold" /> Filter Curation
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-neutral-400 hover:text-luxury-gold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="space-y-5">
            {/* Gender Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Gender</label>
              <div className="flex gap-2">
                {["men", "women", "unisex"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(selectedGender === g ? "" : g)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                      selectedGender === g
                        ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                        : "border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Category</label>
              <div className="flex flex-col gap-1.5">
                {categoryOptions.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCategory(selectedCategory === c.slug ? "" : c.slug)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                      selectedCategory === c.slug
                        ? "bg-luxury-gold/10 text-luxury-gold font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Brand</label>
              <div className="flex flex-wrap gap-1.5">
                {brandOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(selectedBrand === b ? "" : b)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all duration-300 ${
                      selectedBrand === b
                        ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                        : "border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
                <span>Max Price</span>
                <span className="text-neutral-800 dark:text-white font-serif">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="50"
                max="15000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-luxury-gold"
              />
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rating</label>
              <div className="flex gap-2">
                {[4.0, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? 0 : r)}
                    className={`flex-1 py-1 rounded-lg border text-xs font-medium transition-all duration-300 ${
                      minRating === r
                        ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                        : "border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {r}+ ★
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Min Discount</label>
              <div className="flex gap-2">
                {[10, 20, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setMinDiscount(minDiscount === d ? 0 : d)}
                    className={`flex-1 py-1 rounded-lg border text-xs font-medium transition-all duration-300 ${
                      minDiscount === d
                        ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold"
                        : "border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {d}%+ Off
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-200/50 dark:border-neutral-900/50 pb-4">
            <h2 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              {results.length} Products Found
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-neutral-200 dark:bg-neutral-900 animate-pulse"></div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Info size={40} className="mx-auto text-neutral-400" />
              <p className="text-sm font-medium text-neutral-500">No premium items match your active filters.</p>
              <button
                onClick={handleResetFilters}
                className="text-xs px-4 py-2 rounded-full border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-neutral-950 font-bold transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {results.map((product) => (
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
      </div>
      
      {/* Visual Search AI Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-card-dark border border-white/10 p-6 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-luxury-gold animate-pulse" /> AI Visual Search
              </h3>
              <button 
                onClick={() => {
                  setShowImageModal(false);
                  setImageFile(null);
                  setImagePreview(null);
                }} 
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Image Preview */}
            <div className="h-44 w-full rounded-xl overflow-hidden border border-white/5 relative bg-neutral-950 flex items-center justify-center">
              {imagePreview && (
                <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-[10px] text-neutral-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">Photo Uploaded Successfully</span>
              </div>
            </div>

            {/* Keyword Input Form */}
            <form onSubmit={handleImageSearchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">What is in the photo?</label>
                <input
                  type="text"
                  placeholder="e.g. Blue Denim Jacket, Silk Saree, Black Suit..."
                  value={detectedQuery}
                  onChange={(e) => setDetectedQuery(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-luxury-gold text-white text-sm"
                  required
                />
              </div>

              {/* Suggestions Chips */}
              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-widest">Or Select a Keyword Tag:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Suit", "Dress", "Saree", "Jeans", "T-Shirt", "Sneakers", "Watch", "Handbag"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setDetectedQuery(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                        detectedQuery.toLowerCase().includes(tag.toLowerCase())
                          ? "bg-luxury-gold/25 border-luxury-gold text-luxury-gold"
                          : "border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-luxury-gold hover:bg-luxury-golddark text-neutral-900 font-bold text-sm transition-all duration-300 shadow-luxury-glow/10 flex items-center justify-center gap-1.5 mt-2"
              >
                <Search size={16} /> Find Matches & Compare Prices
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050506] text-white">
        <div className="animate-pulse flex items-center gap-2">
          <Sparkles className="text-luxury-gold animate-spin" size={20} />
          <span className="font-serif tracking-wider text-sm text-neutral-400">LOADING SEARCH PLATFORM...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
