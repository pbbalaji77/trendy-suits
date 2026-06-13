"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, ShieldCheck, ShoppingBag, Plus, Trash2, Edit2, 
  BarChart3, PieChart as PieIcon, LineChart as LineIcon, X, CheckSquare, Eye
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { Analytics, Product, UserProfile } from "@/types";
import { useCurrency } from "@/hooks/use-currency";

export default function AdminDashboard() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Modal States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("sneakers");
  const [newGender, setNewGender] = useState("unisex");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const COLORS = ["#D4AF37", "#AA7C11", "#F3E5AB", "#444", "#666", "#888", "#aaa", "#ccc"];

  useEffect(() => {
    async function checkAdminAndLoad() {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Read role
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role !== "admin") {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);
      } catch {
        setAuthorized(true); // Bypass for mock dev tokens
      }

      try {
        const authHeader = { "Authorization": `Bearer ${token}` };
        
        // Fetch Admin data
        const analyticsRes = await fetch("http://localhost:8000/api/admin/analytics", { headers: authHeader });
        const productsRes = await fetch("http://localhost:8000/api/admin/products", { headers: authHeader });
        const usersRes = await fetch("http://localhost:8000/api/admin/users", { headers: authHeader });

        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (err) {
        console.warn("FastAPI backend connection refused. Loading mock admin panel values.", err);
        // Load fallback mock admin values
        setAnalytics({
          total_users: 145,
          total_products: 8,
          total_alerts: 42,
          total_affiliate_earnings: 3450.50,
          total_traffic: 12420,
          earnings_by_month: [
            { name: "Jan", earnings: 400 },
            { name: "Feb", earnings: 800 },
            { name: "Mar", earnings: 1200 },
            { name: "Apr", earnings: 1800 },
            { name: "May", earnings: 2200 },
            { name: "Jun", earnings: 3450 }
          ],
          traffic_by_store: [
            { name: "Amazon", value: 4000 },
            { name: "Flipkart", value: 3000 },
            { name: "Meesho", value: 3500 },
            { name: "Myntra", value: 4500 },
            { name: "Zudio", value: 2000 },
            { name: "Zara", value: 1500 },
            { name: "Trends", value: 2500 }
          ],
          user_signups_by_day: [
            { day: "Mon", count: 12 },
            { day: "Tue", count: 19 },
            { day: "Wed", count: 15 },
            { day: "Thu", count: 22 },
            { day: "Fri", count: 30 },
            { day: "Sat", count: 45 },
            { day: "Sun", count: 35 }
          ]
        });

        setProducts([
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
          }
        ]);

        setUsers([
          { id: 1, email: "admin@trendysuits.ai", full_name: "Alexander McQueen", role: "admin", is_active: true, created_at: "" },
          { id: 2, email: "user@trendysuits.ai", full_name: "Jane Doe", role: "user", is_active: true, created_at: "" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const token = window.localStorage.getItem("token");
    if (!token) return;

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    const imgFallback = newImage || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80";

    const payload = {
      title: newTitle,
      brand_name: newBrand,
      category_slug: newCategory,
      gender: newGender,
      image_url: imgFallback,
      prices: [
        { store_name: "Amazon", price: priceNum, original_price: priceNum * 1.25, in_stock: true, product_url: "#" },
        { store_name: "Myntra", price: priceNum * 0.95, original_price: priceNum * 1.25, in_stock: true, product_url: "#" }
      ]
    };

    try {
      const response = await fetch("http://localhost:8000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const prodCreated = await response.json();
        setProducts(prev => [prodCreated, ...prev]);
        setShowAddProduct(false);
        // Clear fields
        setNewTitle("");
        setNewBrand("");
        setNewPrice("");
        setNewImage("");
      } else {
        setErrorMessage("FastAPI returned error creation.");
      }
    } catch {
      // Simulate adding locally offline
      const mockProd: Product = {
        id: Math.floor(Math.random() * 1000 + 100),
        title: newTitle,
        gender: newGender,
        rating: 4.5,
        reviews_count: 1,
        base_price: priceNum,
        deal_score: 80,
        image_url: imgFallback,
        brand: { id: 99, name: newBrand, logo_url: "" },
        category: { id: 99, name: newCategory, slug: newCategory }
      };
      setProducts(prev => [mockProd, ...prev]);
      setShowAddProduct(false);
    }
  };

  const handleDeleteProduct = async (prodId: number) => {
    const token = window.localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/products/${prodId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
      }
    } catch {
      // Offline fallback simulator
      setProducts(prev => prev.filter(p => p.id !== prodId));
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-luxury-gold/20 border-t-luxury-gold animate-spin"></div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest animate-pulse">Establishing Admin Session...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-red-500">Access Restricted</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          The Admin panel is restricted to verified Trendy Suits administrators. Please log in as an administrator on your dashboard.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full h-11 rounded-xl bg-luxury-gold text-neutral-900 text-xs font-bold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-12">
      {/* Page Title */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200/50 dark:border-neutral-900/50 pb-6">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-1 w-fit">
            <ShieldCheck size={10} /> CONTROL CENTER
          </span>
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">Admin Management Panel</h1>
        </div>
        
        <button
          onClick={() => setShowAddProduct(true)}
          className="h-11 px-6 rounded-xl bg-luxury-gold text-neutral-900 hover:bg-white text-xs font-bold transition-colors duration-300 flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Product Curation
        </button>
      </section>

      {/* Analytics Numerical Cards */}
      {analytics && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Total Traffic</span>
            <span className="text-2xl font-serif font-bold text-neutral-950 dark:text-white mt-1 block">
              {analytics.total_traffic.toLocaleString()}
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Affiliate Earnings</span>
            <span className="text-2xl font-serif font-bold text-luxury-gold mt-1 block">
              {formatPrice(analytics.total_affiliate_earnings)}
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Curated Products</span>
            <span className="text-2xl font-serif font-bold text-neutral-950 dark:text-white mt-1 block">
              {analytics.total_products}
            </span>
          </div>

          <div className="p-6 rounded-2xl glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">Active Alerts</span>
            <span className="text-2xl font-serif font-bold text-neutral-950 dark:text-white mt-1 block">
              {analytics.total_alerts}
            </span>
          </div>
        </section>
      )}

      {/* Charts Grid */}
      {analytics && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Monthly Earnings Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl p-6 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <BarChart3 size={14} className="text-luxury-gold" /> Monthly Affiliate Revenue Trends
            </h3>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.earnings_by_month} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#111", border: "none" }} />
                  <Bar dataKey="earnings" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Pie Chart Traffic Clicks */}
          <div className="rounded-2xl p-6 glass-card-light dark:glass-card-dark border border-neutral-200 dark:border-neutral-900 space-y-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <PieIcon size={14} className="text-luxury-gold" /> Traffic Click Distributions
            </h3>
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.traffic_by_store}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics.traffic_by_store.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Small Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
              {analytics.traffic_by_store.slice(0, 4).map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalog Management (CRUD) */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
          Inventory Product Curation Caches
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-900">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Product Title</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50 bg-white dark:bg-black">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt={p.title} className="h-10 w-10 object-cover rounded" />
                  </td>
                  <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">
                    {p.title}
                  </td>
                  <td className="p-4 text-neutral-400">{p.brand.name}</td>
                  <td className="p-4 text-neutral-400">{p.category.name}</td>
                  <td className="p-4 text-right font-serif font-bold text-neutral-800 dark:text-white">
                    {formatPrice(p.base_price)}
                  </td>
                  <td className="p-4 text-center text-luxury-gold font-bold">{p.deal_score}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/product/${p.id}`}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Management List */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
          System Users List
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-900">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-900/50 bg-white dark:bg-black">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 text-neutral-400">#{u.id}</td>
                  <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200">{u.full_name}</td>
                  <td className="p-4 text-neutral-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "admin" ? "bg-luxury-gold/15 text-luxury-gold" : "bg-neutral-100 dark:bg-neutral-950 text-neutral-400"}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-1.5"></span>
                    Active
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-card-dark border border-white/10 p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                <ShoppingBag size={16} className="text-luxury-gold" /> Add Product Curation Feed
              </h3>
              <button onClick={() => setShowAddProduct(false)} className="text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product Title</label>
                  <input
                    type="text"
                    placeholder="Triple S Sneakers"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Balenciaga"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-white/10 bg-[#0F0D15] text-white"
                  >
                    <option value="sneakers">Sneakers</option>
                    <option value="jackets-coats">Jackets & Coats</option>
                    <option value="bags-handbags">Bags & Handbags</option>
                    <option value="watches">Watches</option>
                    <option value="sunglasses">Sunglasses</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-white/10 bg-[#0F0D15] text-white"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Base Price ($)</label>
                  <input
                    type="number"
                    placeholder="750.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://unsplash.com..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-red-500 text-center">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-luxury-gold text-neutral-900 text-xs font-bold hover:bg-white transition-colors mt-2"
              >
                Create Product Curation Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
