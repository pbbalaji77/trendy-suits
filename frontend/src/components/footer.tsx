import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-900 bg-neutral-100 dark:bg-black py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Trendy Suits AI" className="h-9 w-9 rounded-full object-cover border border-luxury-gold/30" />
              <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                TRENDY<span className="text-luxury-gold font-sans font-medium text-lg">SUITS</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 flex items-center gap-0.5">
                AI
              </span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              Trendy Suits AI is a premium fashion-tech price comparison engine. We aggregate and analyze pricing feeds from top online boutiques to help you acquire luxury and high-street clothing for the best market value.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/deals" className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold transition-colors">
                  Trending Deals
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold transition-colors">
                  Fashion Search
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold transition-colors">
                  Management Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Partnerships
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors">
                  Affiliate Program
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors">
                  Boutique Integration
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors">
                  Ad Placements
                </span>
              </li>
              <li>
                <span className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200/60 dark:border-neutral-900/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <p>© {new Date().getFullYear()} Trendy Suits AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart size={10} className="text-red-500 fill-red-500" /> for luxury fashion curation.
          </p>
        </div>
      </div>
    </footer>
  );
}
