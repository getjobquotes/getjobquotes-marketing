import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: set on request so server components can read them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild response with updated cookies
          supabaseResponse = NextResponse.next({ request });
          // Step 3: set on response so browser receives them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              path: "/",
            })
          );
        },
      },
    }
  );

  // IMPORTANT: do NOT call supabase.auth.getSession() here —
  // use getUser() which validates the token server-side
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const PROTECTED = ["/dashboard", "/tool", "/profile", "/customers"];

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Don't redirect logged-in users away from /auth (they may be
  // re-authenticating or coming from a ?next= link)
  if (pathname === "/auth" && user && !request.nextUrl.searchParams.get("next")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // CRITICAL: return supabaseResponse, not NextResponse.next()
  // Returning a different response drops the auth cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ads.txt|api|demo|status|q/|sitemap|robots|manifest|icon).*)",
  ],
};
