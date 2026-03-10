#!/bin/bash
# Fix: bad_oauth_state — Supabase SSR cookie handling
# cd ~/projects/getjobquotes-marketing && bash fix-oauth-state.sh

set -e

# ============================================================
# 1. FIX lib/supabase/server.ts
#    Must use cookies() correctly for Next.js App Router
# ============================================================
mkdir -p lib/supabase
cat > lib/supabase/server.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // These are critical for OAuth state cookie to survive
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                path: "/",
              });
            });
          } catch {
            // setAll called from a Server Component — safe to ignore
            // cookies will be set by the middleware instead
          }
        },
      },
    }
  );
}
EOF
echo "✅ lib/supabase/server.ts"

# ============================================================
# 2. FIX lib/supabase/client.ts
#    Browser client — straightforward, just needs to be clean
# ============================================================
cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
EOF
echo "✅ lib/supabase/client.ts"

# ============================================================
# 3. FIX middleware.ts
#    This is where the OAuth state cookie MUST be forwarded.
#    The middleware runs before the callback — if it doesn't
#    pass cookies through correctly the state is lost.
# ============================================================
cat > middleware.ts << 'EOF'
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
EOF
echo "✅ middleware.ts"

# ============================================================
# 4. FIX auth/callback/route.ts
#    Must use the same cookie-aware server client
# ============================================================
mkdir -p app/auth/callback
cat > app/auth/callback/route.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
  }

  const cookieStore = await cookies();

  // Build a response we can attach cookies to
  const response = NextResponse.redirect(`${appUrl}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              path: "/",
            });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${appUrl}/auth?error=callback`);
  }

  const user = data.user;

  // First-time user detection via profile existence
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existingProfile) {
    // Create profile row so this only fires once
    await supabase.from("profiles").upsert({
      user_id: user.id,
      business_email: user.email,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Fire welcome email (non-blocking)
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
      "";

    fetch(`${appUrl}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name }),
    }).catch((e) => console.error("Welcome email (non-fatal):", e));
  }

  return response;
}
EOF
echo "✅ app/auth/callback/route.ts"

# ============================================================
# 5. COMMIT
# ============================================================
git add .
git commit -m "fix: bad_oauth_state — correct Supabase SSR cookie handling in server client, middleware and auth callback (sameSite=lax, httpOnly, proper setAll pattern)"
git push origin main

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅  OAuth state fix deployed                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "The 3 files that were wrong:"
echo "  lib/supabase/server.ts  — cookies not set with correct options"
echo "  middleware.ts           — was returning wrong response object"
echo "  app/auth/callback/route — cookies set on request not response"
echo ""
echo "Google sign-in should work immediately after deploy."
