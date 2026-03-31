/**
 * Determines whether ads should be shown on a given pathname.
 * Ads are ONLY allowed on public marketing/content pages.
 */

const AD_ALLOWED_PREFIXES = [
  "/",           // landing page (exact)
  "/guides",
  "/help",
  "/templates",
  "/features",
  "/about",
  "/demo",
];

const AD_BLOCKED_PREFIXES = [
  "/dashboard",
  "/tool",
  "/profile",
  "/customers",
  "/settings",
  "/pricing",    // no ads on checkout pages
  "/auth",
  "/api",
  "/q/",         // public quote acceptance
];

export function shouldShowAds(pathname: string): boolean {
  // Check blocked first (takes priority)
  if (AD_BLOCKED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return false;
  }
  // Landing page exact match
  if (pathname === "/") return true;
  // Check allowed prefixes
  return AD_ALLOWED_PREFIXES.some(prefix =>
    prefix !== "/" && pathname.startsWith(prefix)
  );
}
