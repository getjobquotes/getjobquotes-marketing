import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${appUrl}/dashboard`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${appUrl}/auth?error=callback_failed`);
  }

  // Create profile for new users + send welcome email
  const user = data.user;
  const { data: existing } = await supabase
    .from("profiles").select("id").eq("user_id", user.id).maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      business_email: user.email,
    });
    // Fire welcome email (non-blocking)
    const name = user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] || "";
    fetch(`${appUrl}/api/email/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name }),
    }).catch(() => {});
  }

  return response;
}
