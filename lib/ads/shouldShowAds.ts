
/**
 * Ad placement rules — conservative.
 * AdSense pending approval. Ads only on content-rich public pages.
 * Not shown on any app, auth, or utility pages.
 */

const AD_ALLOWED: string[] = [
  "/guides/",
  "/help/",
  "/templates/",
];

const AD_BLOCKED_PREFIXES: string[] = [
  "/dashboard",
  "/tool",
  "/profile",
  "/customers",
  "/settings",
  "/pricing",
  "/auth",
  "/api",
  "/q/",
  "/demo",  // utility page, not content
  "/features",
  "/about",
  "/contact",
];

// Landing page: only show ads if AdSense approved
// Currently set to false until approval confirmed
const ADSENSE_APPROVED = false;

export function shouldShowAds(pathname: string): boolean {
  if (!ADSENSE_APPROVED) return false;

  if (AD_BLOCKED_PREFIXES.some(p => pathname.startsWith(p))) return false;

  if (pathname === "/") return true;

  return AD_ALLOWED.some(p => pathname.startsWith(p));
}
