"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Heart, X, CheckCircle } from "lucide-react";

export default function Footer() {
  const [partnershipType, setPartnershipType] = useState<string | null>(null);
  const [showToS, setShowToS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });

  const handleOpenPartnership = (type: string) => {
    setPartnershipType(type);
    setIsSubmitted(false);
  };

  const handleClosePartnership = () => {
    setPartnershipType(null);
    setFormData({ name: "", email: "", company: "", message: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

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
                <span 
                  onClick={() => handleOpenPartnership("Affiliate Program")} 
                  className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors block"
                >
                  Affiliate Program
                </span>
              </li>
              <li>
                <span 
                  onClick={() => handleOpenPartnership("Boutique Integration")} 
                  className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors block"
                >
                  Boutique Integration
                </span>
              </li>
              <li>
                <span 
                  onClick={() => handleOpenPartnership("Ad Placements")} 
                  className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors block"
                >
                  Ad Placements
                </span>
              </li>
              <li>
                <span 
                  onClick={() => setShowToS(true)} 
                  className="text-neutral-500 dark:text-neutral-400 hover:text-luxury-gold cursor-pointer transition-colors block"
                >
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

      {/* Partnerships Modal */}
      {partnershipType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={handleClosePartnership}
              className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 mb-2">
                    <Sparkles size={12} />
                    <span>Inquiry</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
                    {partnershipType} Partnership
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Submit your proposal to integrate with Trendy Suits AI comparison index.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-luxury-gold dark:focus:border-luxury-gold text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. partner@boutique.com"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-luxury-gold dark:focus:border-luxury-gold text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Company / Brand Name
                    </label>
                    <input 
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Zara, Amazon Affiliate, or Boutique Brand"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-luxury-gold dark:focus:border-luxury-gold text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Proposal / Message *
                    </label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your partnership proposal, traffic volumes, or boutique inventory size..."
                      className="w-full p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-luxury-gold dark:focus:border-luxury-gold text-neutral-900 dark:text-white resize-none font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={handleClosePartnership}
                    className="h-10 px-4 rounded-full border border-neutral-200 dark:border-neutral-800 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 px-6 rounded-full bg-luxury-gold text-neutral-950 text-sm font-bold hover:bg-luxury-gold/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Submit Proposal"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center text-luxury-gold">
                  <CheckCircle size={56} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-serif">Inquiry Submitted!</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    Thank you for your interest in partnering with Trendy Suits AI. Our business development team will review your proposal and contact you within 2-3 business days.
                  </p>
                </div>
                <button 
                  onClick={handleClosePartnership}
                  className="px-6 py-2 rounded-full bg-luxury-gold text-neutral-950 font-bold text-sm hover:bg-luxury-gold/90 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showToS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setShowToS(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
                  Terms of Service & Affiliate Agreement
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Last updated: June 13, 2026
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-4 pr-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">1. Acceptance of Terms</h4>
                  <p className="text-xs mt-1">
                    By accessing and utilizing the services provided by Trendy Suits AI, you consent to be bound by these Terms of Service. We compare prices from affiliate platforms including Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, and Trends.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">2. Affiliate Disclaimer & Platform Outlinks</h4>
                  <p className="text-xs mt-1">
                    Trendy Suits AI is a price comparison catalog and search engine. Outgoing links to online merchants (such as Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, Trends) are seeded with our official affiliate tracking parameters. Clicking these links redirects you directly to the respective store, and we may earn an affiliate commission on qualifying transactions.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">3. Third-Party Pricing & Inventory Accuracy</h4>
                  <p className="text-xs mt-1">
                    Prices, inventory status, sizing options, and delivery information are fetched periodically or simulated dynamically. Trendy Suits AI makes every reasonable effort to display accurate pricing starting from ₹100; however, final purchase prices, discounts, and inventory availability are controlled entirely by the third-party merchant sites.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">4. User Accounts & Security Restrictions</h4>
                  <p className="text-xs mt-1">
                    Accessing product outbound redirect pages ("Visit Store" / "Buy Now"), adding items to the Wardrobe list, or creating price alert tracking entries requires user registration or login.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-neutral-100 dark:border-neutral-900">
                <button 
                  onClick={() => setShowToS(false)}
                  className="h-10 px-6 rounded-full bg-luxury-gold text-neutral-950 text-sm font-bold hover:bg-luxury-gold/90 transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
