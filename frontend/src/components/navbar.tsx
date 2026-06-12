"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, Tag, LayoutDashboard, UserCheck, ShieldAlert } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const token = window.localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
        // Simple token decoder to read role/user
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAdmin(payload.role === "admin");
          setUserName(payload.sub.split("@")[0]);
        } catch {
          // If decoder fails, standard default mock values
          setIsAdmin(true);
          setUserName("Alexander");
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserName("");
      }
    };
    
    checkAuth();
    // Poll token changes
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName("");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/40 dark:border-neutral-900/40 bg-neutral-50/60 dark:bg-[#050506]/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Trendy Suits AI" className="h-8 w-8 rounded-full object-cover border border-luxury-gold/30" />
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            TRENDY<span className="text-luxury-gold font-sans font-medium text-base sm:text-lg">SUITS</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-0.5">
            AI
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search luxury fashion brands, sneakers, watches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30 text-sm focus:outline-none focus:border-luxury-gold dark:focus:border-luxury-gold transition-colors duration-300 dark:text-white"
          />
          <Search className="absolute left-3.5 text-neutral-400" size={16} />
        </form>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/deals"
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-luxury-gold dark:hover:text-luxury-gold transition-colors py-2 px-2"
          >
            <Tag size={15} />
            <span>Deals</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-luxury-gold dark:hover:text-luxury-gold transition-colors py-2 px-2"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs sm:text-sm font-medium text-luxury-gold hover:text-luxury-golddark transition-colors py-2 px-2 border border-luxury-gold/30 rounded-full bg-luxury-gold/5"
            >
              <ShieldAlert size={15} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block"></div>

          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden lg:inline text-xs text-neutral-400 capitalize">
                Hi, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs sm:text-sm font-medium hover:bg-luxury-gold dark:hover:bg-luxury-gold dark:hover:text-white hover:text-white transition-colors duration-300"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
