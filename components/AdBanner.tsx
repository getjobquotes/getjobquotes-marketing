"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical";
  className?: string;
}

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || "";

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (!adsenseId) return null;

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
