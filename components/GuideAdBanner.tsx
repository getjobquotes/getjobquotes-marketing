
"use client";
import { useEffect, useRef } from "react";

export default function GuideAdBanner({ slot = "auto", className = "" }: {
  slot?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !ref.current) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  return (
    <div ref={ref} className={`w-full overflow-hidden my-6 ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: "90px" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
