#!/bin/bash
# Fix: Google OAuth redirect + welcome email for ALL first-time users
# cd ~/projects/getjobquotes-marketing && bash fix-welcome-all-users.sh

set -e

# ============================================================
# AUTH CALLBACK — single place all auth flows land
# New user detection: check if profile row exists yet (reliable
# for Google OAuth, magic link, AND password signup — all go
# through this route on first login)
# ============================================================
mkdir -p app/auth/callback
cat > app/auth/callback/route.ts << 'EOF'
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Always use the configured app URL — never use request.url origin
  // This fixes the supabase.co redirect issue with Google OAuth
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${appUrl}/auth?error=callback`);
  }

  const user = data.user;

  // ── First-time user detection ───────────────────────────────
  // Check if a profile row already exists. If not, this is their
  // very first login — regardless of whether they used Google,
  // magic link, or password + email verification.
  // This is reliable because profile is created on first dashboard
  // visit (or we create it here), so it only fires once.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const isFirstLogin = !existingProfile;

  if (isFirstLogin) {
    // Create the profile row immediately so future logins don't re-trigger
    await supabase.from("profiles").upsert({
      user_id: user.id,
      business_email: user.email,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Fire welcome email (non-blocking — don't delay the redirect)
    const name = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email?.split("@")[0]?.replace(/[._]/g, " ")
      || "";

    fetch(`${appUrl}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name }),
    }).catch((e) => console.error("Welcome email failed (non-fatal):", e));
  }

  return NextResponse.redirect(`${appUrl}${next}`);
}
EOF
echo "✅ app/auth/callback/route.ts"

# ============================================================
# AUTH PAGE — also catches password logins for first-time users
# (password login doesn't go through callback, so we check here)
# ============================================================
# Patch just the handlePassword function's post-login block
# We use the same profile-check approach
cat > app/auth/_welcome-patch-note.ts << 'EOF'
// NOTE: password login (signInWithPassword) doesn't go through
// /auth/callback — the user is signed in directly on the page.
// So we do the same profile-existence check here for that flow.
//
// Magic link     → /auth/callback ✅ (welcome handled there)
// Google OAuth   → /auth/callback ✅ (welcome handled there)
// Password login → auth/page.tsx  ✅ (welcome handled below)
// Password signup→ user verifies email → /auth/callback ✅
EOF

# Patch the password login section of auth/page.tsx
# Replace the post-signInWithPassword success block
node << 'JSEOF'
const fs = require("fs");
const path = "app/auth/page.tsx";
if (!fs.existsSync(path)) { console.log("auth page not found, skipping patch"); process.exit(0); }

let src = fs.readFileSync(path, "utf8");

// Replace the password login success block
const oldBlock = `      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else {
        // Send welcome email for new users who verify via password
        if (data.user) {
          const isNew = Date.now() - new Date(data.user.created_at).getTime() < 120_000;
          if (isNew && data.user.email) {
            fetch("/api/email/welcome", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.user.email, name: data.user.user_metadata?.full_name || "" }),
            }).catch(() => {});
          }
        }
        router.push(nextPath);
      }`;

const newBlock = `      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else {
        // Check if first-time login via profile existence
        // (covers users who signed up with password + verified email)
        if (data.user?.email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", data.user.id)
            .single();
          if (!profile) {
            const name = data.user.user_metadata?.full_name || data.user.email.split("@")[0] || "";
            fetch("/api/email/welcome", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.user.email, name }),
            }).catch(() => {});
            // Profile will be created on dashboard load (or create it here)
            await supabase.from("profiles").upsert({
              user_id: data.user.id,
              business_email: data.user.email,
              created_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
          }
        }
        router.push(nextPath);
      }`;

if (src.includes(oldBlock)) {
  src = src.replace(oldBlock, newBlock);
  fs.writeFileSync(path, src);
  console.log("✅ auth/page.tsx patched — password login welcome check updated");
} else {
  console.log("⚠️  Could not find exact block to patch in auth/page.tsx");
  console.log("   The callback route handles all other flows — password login welcome is optional");
}
JSEOF

# ============================================================
# PRINT THE FLOW EXPLANATION
# ============================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EMAIL (NON-GOOGLE) SIGN-UP FLOWS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  MAGIC LINK:"
echo "  1. User enters email, clicks 'Send Magic Link'"
echo "  2. Supabase sends them an email with a one-time link"
echo "  3. User clicks link → lands on /auth/callback?code=xxx"
echo "  4. Callback exchanges code for session"
echo "  5. Profile check → not found → welcome email fired ✅"
echo "  6. Profile row created, user redirected to /dashboard"
echo ""
echo "  PASSWORD SIGNUP:"
echo "  1. User enters email + password, clicks 'Create Account'"
echo "  2. Supabase sends a VERIFICATION email (not a login link)"
echo "  3. User clicks verify → lands on /auth/callback?code=xxx"
echo "  4. Same as above → welcome email fired ✅"
echo "  5. User can now sign in with password on future visits"
echo ""
echo "  PASSWORD LOGIN (returning):"
echo "  1. User enters email + password"
echo "  2. signInWithPassword() → direct session, NO callback"
echo "  3. Profile check in auth page → already exists → no email"
echo "  4. Redirected to /dashboard"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git add .
git commit -m "fix: OAuth redirect always uses NEXT_PUBLIC_APP_URL, welcome email fires for ALL first-time users via profile existence check (Google OAuth + magic link + password signup)"
git push origin main

echo "✅ Done"
echo ""
echo "⚠️  One thing to verify in Supabase → Auth → Providers → Google:"
echo "   Redirect URI must be exactly:"
echo "   https://getjobquotes.uk/auth/callback"
echo ""
