"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AIChatProps {
  productId?: number;
  productTitle?: string;
}

export default function AIChat({ productId, productTitle }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome messages
  useEffect(() => {
    const defaultWelcome = productTitle
      ? `Hello! I am your AI Fashion Assistant. Ask me anything about the **${productTitle}**! For example:\n- *Is this product worth buying?*\n- *Which store has the lowest price?*\n- *Show me similar alternatives.*`
      : "Welcome to Trendy Suits AI! I am your personal shopping assistant. Ask me to find the best deals, compare store prices, or predict price changes for your favorite items!";
      
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: defaultWelcome,
        timestamp: new Date()
      }
    ]);
  }, [productTitle, productId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // API call to the backend
      const response = await fetch(
        productId 
          ? `http://localhost:8000/api/products/${productId}/chat` 
          : `http://localhost:8000/api/products/1/chat`, // default product fallback
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg.text })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "ai",
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error("API failed");
      }
    } catch {
      // Local mockup AI logic fallback if backend isn't reachable
      setTimeout(() => {
        let reply = "";
        const text = userMsg.text.toLowerCase();
        
        if (text.includes("price") || text.includes("cheapest") || text.includes("lowest")) {
          reply = productTitle 
            ? `The lowest price for **${productTitle}** is currently on **Trends** at **$95.00**, saving you 25% off the original price. Other stores like Amazon ($105.00) and Zara ($112.00) are higher.`
            : "Simply enter the item name in the search bar above, and I will show you the lowest price across Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, and Trends!";
        } else if (text.includes("worth") || text.includes("should i buy")) {
          reply = productTitle
            ? `With a rating of **4.6★** and a Deal Score of **85/100**, this is a highly rated item with a strong discount. I recommend buying now before the price rebounds.`
            : "Yes! High-rated fashion products with a Deal Score above 75 are excellent purchases and represent real savings.";
        } else if (text.includes("alternative") || text.includes("similar")) {
          reply = `Here are some popular alternatives to this item:\n1. **Gucci Marmont Shoulder Bag** ($2,100)\n2. **Prada Nylon Re-Edition Bag** ($1,850)\nThese options feature similar premium aesthetics and excellent reviews.`;
        } else {
          reply = "I'm analyzing the catalog for you. Trendy Suits AI monitors price drops in real-time across Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, and Trends. Let me know if you need specific price comparison charts, price predictions, or size options!";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "ai",
            text: reply,
            timestamp: new Date()
          }
        ]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-luxury-charcoal text-white border border-luxury-gold/30 hover:border-luxury-gold shadow-lg hover:shadow-luxury-glow transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        aria-label="Ask AI Assistant"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} className="text-luxury-gold" />}
        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-luxury-gold text-neutral-900 border border-neutral-900 animate-pulse">
            AI
          </span>
        )}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl glass-card-dark border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-neutral-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Shopping Assistant
                </h3>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                  Price Prediction Engine Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Ctn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-luxury-gold text-neutral-900 font-medium rounded-tr-none"
                      : "bg-white/5 text-neutral-200 border border-white/5 rounded-tl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-neutral-200 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-white/5 bg-neutral-950/40 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask about lowest prices, sizing, deals..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-9 px-3 rounded-full bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-luxury-gold dark:text-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-full bg-luxury-gold text-neutral-900 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:hover:bg-luxury-gold"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
