#!/bin/bash
# Combined fix: OAuth state + middleware callback + contact email
# cd ~/projects/getjobquotes-marketing && bash fix-all.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  GetJobQuotes — Combined Fix             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ============================================================
# 1. lib/supabase/server.ts — correct cookie options
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
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                path: "/",
              });
            });
          } catch {
            // Called from Server Component — middleware handles it
          }
        },
      },
    }
  );
}
EOF
echo "✅ lib/supabase/server.ts"

# ============================================================
# 2. lib/supabase/client.ts — clean browser client
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
# 3. middleware.ts — correct cookie forwarding AND
#    /auth/callback EXCLUDED from matcher (root cause of
#    bad_oauth_state — middleware was consuming the state
#    cookie before the callback route handler could use it)
# ============================================================
cat > middleware.ts << 'EOF'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const PROTECTED = ["/dashboard", "/tool", "/profile", "/customers"];

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/auth" && user && !request.nextUrl.searchParams.get("next")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // CRITICAL: auth/callback must be excluded — middleware calling
    // getUser() consumes the OAuth state cookie before the route
    // handler can exchange it, causing bad_oauth_state error
    "/((?!_next/static|_next/image|favicon\\.ico|ads\\.txt|robots\\.txt|manifest\\.json|icon|api/|auth/callback|demo|status|q/|sitemap).*)",
  ],
};
EOF
echo "✅ middleware.ts — /auth/callback excluded from matcher"

# ============================================================
# 4. auth/callback/route.ts — cookies set on response object
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

  // First-time user check via profile existence
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").upsert({
      user_id: user.id,
      business_email: user.email,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0]?.replace(/[._-]/g, " ") || "";

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
# 5. Replace all hello@ with support@ everywhere
# ============================================================
echo "📧 Updating contact email to support@getjobquotes.uk..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  -exec sed -i 's/hello@getjobquotes\.uk/support@getjobquotes.uk/g' {} +
echo "✅ All contact emails updated to support@getjobquotes.uk"

# ============================================================
# 6. Commit and push
# ============================================================
git add .
git commit -m "fix: bad_oauth_state (exclude auth/callback from middleware, correct SSR cookie handling), update contact email to support@"
git push origin main

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  ✅  All fixes applied & deployed        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Google sign-in should work after Vercel deploys (~30s)"
echo "  Contact email: support@getjobquotes.uk everywhere"
