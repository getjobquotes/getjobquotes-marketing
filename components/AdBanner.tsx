"use client";
import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export default function AdBanner({ slot = "auto", format = "auto", className = "" }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    // Only show ads if user consented (or no preference yet = consent not declined)
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (consent === "essential") return; // User opted out of analytics
    pushed.current = true;
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch {}
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
