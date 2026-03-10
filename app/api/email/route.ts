import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`email:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, to, subject, html } = body;

  if (!to || !subject || !html) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await resend.emails.send({
    from: "GetJobQuotes <hello@getjobquotes.uk>",
    to, subject, html,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
