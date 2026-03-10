import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const PROTECTED = ["/dashboard", "/tool", "/profile", "/customers"];

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !user) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Don't redirect logged in users away from /auth if they have a ?next param
  if (pathname === "/auth" && user && !request.nextUrl.searchParams.get("next")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ads.txt|api|demo|status|q|sitemap|robots|manifest|icon).*)"],
};
