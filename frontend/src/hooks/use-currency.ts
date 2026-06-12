"use client";

import { useState, useEffect } from "react";

export interface CurrencyConfig {
  symbol: string;
  code: string;
  rate: number;
}

export function useCurrency() {
  const [config, setConfig] = useState<CurrencyConfig>({ symbol: "$", code: "USD", rate: 1 });

  useEffect(() => {
    const detectCurrency = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isIndia = 
          tz === "Asia/Kolkata" || 
          tz === "Asia/Calcutta" || 
          navigator.language.includes("IN") ||
          navigator.languages?.some(lang => lang.includes("IN"));
          
        if (isIndia) {
          setConfig({ symbol: "₹", code: "INR", rate: 83.5 });
        } else {
          setConfig({ symbol: "$", code: "USD", rate: 1 });
        }
      } catch (e) {
        console.warn("Currency detection failed, defaulting to USD:", e);
      }
    };
    
    detectCurrency();
  }, []);

  const formatPrice = (usdPrice: number) => {
    const converted = usdPrice * config.rate;
    const locale = config.code === "INR" ? "en-IN" : "en-US";
    return converted.toLocaleString(locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return { config, formatPrice };
}
