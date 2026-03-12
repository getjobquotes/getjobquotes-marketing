"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Ads ONLY on home page and demo page — not inside the app
const AD_ALLOWED_PATHS = ["/", "/demo"];

export default function AdBanner({ slot = "3456789012", className = "" }: {
  slot?: string; className?: string;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  const allowed = AD_ALLOWED_PATHS.some(p =>
    pathname === p || pathname.startsWith(p + "?")
  );

  useEffect(() => {
    if (!allowed || pushed.current || !ref.current) return;
    const consent = localStorage.getItem("gjq_cookie_consent");
    if (consent === "essential") return;
    pushed.current = true;
    try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch {}
  }, [allowed]);

  if (!(process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-8942505835940142") || !allowed) return null;

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <ins className="adsbygoogle block"
        style={{ minHeight: "60px" }}
        data-ad-client={(process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-8942505835940142")}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}
