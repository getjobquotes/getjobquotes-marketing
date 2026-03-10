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
