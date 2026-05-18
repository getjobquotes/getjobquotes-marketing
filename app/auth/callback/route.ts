import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = ["/dashboard", "/tool", "/pricing", "/profile", "/customers", "/settings"];
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next") || "/dashboard";
  const safeNext = ALLOWED_NEXT.includes(next) ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/auth?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${APP_URL}/auth?error=exchange_failed`);
  }

  const user = data.session.user;

  // Check if this is a brand new user (no profile yet)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id, onboarding_complete")
    .eq("user_id", user.id)
    .single();

  const isNewUser = !existingProfile;

  if (isNewUser) {
    // Create profile
    await supabase.from("profiles").insert({
      user_id: user.id,
      business_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      business_email: user.email || "",
      onboarding_complete: false,
    }).single();

    // Fire welcome email (non-blocking)
    fetch(`${APP_URL}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    }).catch(() => {});

    // New users → go straight to the tool to see it immediately
    const response = NextResponse.redirect(`${APP_URL}/tool?welcome=1`);
    return response;
  }

  // Returning users → go to dashboard or their intended page
  return NextResponse.redirect(`${APP_URL}${safeNext}`);
}
