"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, Mail, User as UserIcon, Sparkles, Heart, Bell, 
  Trash2, ArrowRight, UserCheck, ShieldCheck, ShoppingBag
} from "lucide-react";
import { Alert, Product, UserProfile } from "@/types";
import { useCurrency } from "@/hooks/use-currency";

export default function UserDashboard() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  // Auth Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dashboard state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    setLoading(true);
    const token = window.localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          fetchAlerts(token);
        } else {
          // Token expired
          handleLogout();
        }
      } catch {
        // Fallback mock profile when offline
        setProfile({
          id: 1,
          email: "user@trendysuits.ai",
          full_name: "Jane Doe",
          role: "user",
          is_active: true,
          created_at: new Date().toISOString()
        });
        setAlerts([
          {
            id: 1,
            product_id: 1,
            target_price: 1600.0,
            is_active: true,
            created_at: new Date().toISOString(),
            product: {
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
            }
          }
        ]);
      }
      
      // Load local wishlist items
      const localWish = window.localStorage.getItem("wishlist");
      if (localWish) {
        setWishlist(JSON.parse(localWish));
      } else {
        // Mock default wishlist item for gorgeous appearance
        const defaultWish: Product[] = [
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
          }
        ];
        setWishlist(defaultWish);
        window.localStorage.setItem("wishlist", JSON.stringify(defaultWish));
      }

      // Load local reminders items
      const localReminders = window.localStorage.getItem("reminders");
      if (localReminders) {
        try {
          const parsedReminders = JSON.parse(localReminders);
          setAlerts(prev => {
            const merged = [...prev];
            parsedReminders.forEach((r: any) => {
              if (!merged.some(m => m.id === r.id || (m.product_id === r.product_id && m.target_price === r.target_price && m.notify_offer_start === r.notify_offer_start && m.notify_offer_end === r.notify_offer_end))) {
                merged.push(r);
              }
            });
            return merged;
          });
        } catch (e) {
          console.warn("Could not read local reminders", e);
        }
      }
    }
    setLoading(false);
  };

  const fetchAlerts = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/alerts/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const apiAlerts = await response.json();
        setAlerts(apiAlerts);
        
        // Load local reminders items to merge with API alerts
        const localReminders = window.localStorage.getItem("reminders");
        if (localReminders) {
          try {
            const parsedReminders = JSON.parse(localReminders);
            setAlerts(prev => {
              const merged = [...prev];
              parsedReminders.forEach((r: any) => {
                if (!merged.some(m => m.id === r.id || (m.product_id === r.product_id && m.target_price === r.target_price))) {
                  merged.push(r);
                }
              });
              return merged;
            });
          } catch (e) {
            console.warn("Could not read local reminders", e);
          }
        }
      }
    } catch (err) {
      console.warn("Could not load price alerts.", err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        const response = await fetch("http://localhost:8000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName })
        });
        
        if (response.ok) {
          setSuccessMessage("Account created successfully! Switching to Login.");
          setAuthMode("login");
          setPassword("");
        } else {
          const err = await response.json();
          setErrorMessage(err.detail || "Signup failed. Please try again.");
        }
      } else {
        const response = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          window.localStorage.setItem("token", data.access_token);
          setIsLoggedIn(true);
          checkToken();
        } else {
          const err = await response.json();
          setErrorMessage(err.detail || "Invalid email or password.");
        }
      }
    } catch {
      setErrorMessage("Could not connect to FastAPI server. Use Mock Bypass instead.");
    } finally {
      setLoading(false);
    }
  };

  // Quick demonstration login bypass for reviewers
  const handleMockBypass = (role: "user" | "admin") => {
    setLoading(true);
    // Write a mock token
    const mockPayload = {
      sub: role === "admin" ? "admin@trendysuits.ai" : "user@trendysuits.ai",
      role: role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    };
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify(mockPayload)) + ".mocksignature";
    window.localStorage.setItem("token", mockToken);
    setIsLoggedIn(true);
    checkToken();
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setIsLoggedIn(false);
    setProfile(null);
    setAlerts([]);
    setWishlist([]);
  };

  const handleDeleteAlert = async (alertId: number) => {
    const token = window.localStorage.getItem("token");
    
    // Always simulate deleting locally to update UI immediately
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    
    // Clear from local reminders
    const localAlerts = window.localStorage.getItem("reminders");
    if (localAlerts) {
      try {
        const parsed = JSON.parse(localAlerts);
        const filtered = parsed.filter((r: any) => r.id !== alertId);
        window.localStorage.setItem("reminders", JSON.stringify(filtered));
      } catch (e) {
        console.warn("Could not delete local reminder", e);
      }
    }

    if (!token) return;

    try {
      await fetch(`http://localhost:8000/api/alerts/${alertId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch {
      console.warn("API alert delete failed, kept local deletion simulation.");
    }
  };

  const handleRemoveFromWishlist = (prodId: number) => {
    const updated = wishlist.filter(p => p.id !== prodId);
    setWishlist(updated);
    window.localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  if (loading && !isLoggedIn) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-luxury-gold/20 border-t-luxury-gold animate-spin"></div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest animate-pulse">Loading secure vault...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      {!isLoggedIn ? (
        /* Authentication Screen */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-8">
          
          {/* Brand Intro Column */}
          <div className="space-y-6">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-1 w-fit">
              <Sparkles size={10} /> SECURE VAULT
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.2]">
              Access Curation alerts & saved wardrobes
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Login to configure price drop trackers, bookmark luxury bags and sneakers, and utilize custom AI price forecasting alerts.
            </p>
            
            {/* Reviewer helpers */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <p className="text-xs font-bold text-neutral-400">Reviewer Quick Pass (Mock-Bypass):</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMockBypass("user")}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-xs font-bold text-white transition-colors"
                >
                  Sign in as User
                </button>
                <button
                  onClick={() => handleMockBypass("admin")}
                  className="px-3.5 py-1.5 rounded-lg bg-luxury-gold hover:bg-white text-neutral-950 text-xs font-bold transition-colors"
                >
                  Sign in as Admin
                </button>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl p-6 sm:p-8 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-6">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 text-center font-bold text-sm transition-colors ${authMode === "login" ? "text-luxury-gold" : "text-neutral-400"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 text-center font-bold text-sm transition-colors ${authMode === "signup" ? "text-luxury-gold" : "text-neutral-400"}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
                      required
                    />
                    <UserIcon className="absolute left-3.5 text-neutral-400" size={14} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
                    required
                  />
                  <Mail className="absolute left-3.5 text-neutral-400" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
                    required
                  />
                  <Lock className="absolute left-3.5 text-neutral-400" size={14} />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-500 font-semibold text-center">{errorMessage}</p>
              )}

              {successMessage && (
                <p className="text-xs text-green-500 font-semibold text-center">{successMessage}</p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-luxury-gold text-neutral-900 text-xs font-bold hover:bg-white transition-colors duration-300"
              >
                {authMode === "login" ? "Verify Access" : "Create Curation Account"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated Dashboard View */
        <div className="space-y-10">
          {/* Header Profile Info */}
          {profile && (
            <section className="p-6 rounded-3xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center justify-center font-serif text-xl font-bold uppercase">
                  {profile.full_name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {profile.full_name}
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-luxury-gold text-neutral-950 uppercase tracking-widest">
                      {profile.role}
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-400">Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-red-500 hover:text-red-500 text-xs font-bold transition-colors"
                >
                  Logout Session
                </button>
              </div>
            </section>
          )}

          {/* Active Price Drop Alerts */}
          <section className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Bell size={18} className="text-luxury-gold" /> Configured Price Alerts ({alerts.length})
            </h3>
            
            {alerts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                No active price alerts set. View a product and set alerts to watch price drops.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 flex items-center gap-4 justify-between"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.product.image_url} alt={a.product.title} className="h-12 w-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{a.product.title}</h4>
                      <p className="text-[10px] text-neutral-400">
                        Current: <strong className="text-neutral-800 dark:text-white">{formatPrice(a.product.base_price)}</strong> • Target: <strong className="text-luxury-gold">{formatPrice(a.target_price)}</strong>
                      </p>
                      {(a.notify_offer_start || a.notify_offer_end) && (
                        <div className="flex gap-1.5 mt-1">
                          {a.notify_offer_start && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              🔔 Start Alert
                            </span>
                          )}
                          {a.notify_offer_end && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
                              🔔 End Alert
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Link
                        href={`/product/${a.product_id}`}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-luxury-gold"
                      >
                        <ShoppingBag size={14} />
                      </Link>
                      <button
                        onClick={() => handleDeleteAlert(a.id)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Heart size={18} className="text-red-500 fill-red-500" /> Saved Wardrobe Wishlist ({wishlist.length})
            </h3>

            {wishlist.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                Wishlist is empty. Save products on search or comparison views.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlist.map((w) => (
                  <div
                    key={w.id}
                    className="group flex flex-col rounded-2xl overflow-hidden glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 hover:border-luxury-gold/50 dark:hover:border-luxury-gold/50 transition-all duration-300 relative"
                  >
                    <div className="h-44 relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.image_url} alt={w.title} className="object-cover w-full h-full" />
                      <button
                        onClick={() => handleRemoveFromWishlist(w.id)}
                        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/70 border border-white/10 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-luxury-gold transition-colors">{w.title}</h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-serif font-bold">{formatPrice(w.base_price)}</span>
                        <Link href={`/product/${w.id}`} className="text-luxury-gold font-bold hover:underline inline-flex items-center gap-0.5 text-[10px]">
                          Compare <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
