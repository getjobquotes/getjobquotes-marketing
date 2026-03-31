import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://getjobquotes.uk").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const { success } = rateLimit(email, "contact");
    if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    // Store in DB
    await supabase.from("contact_messages").insert({
      name: name.trim().slice(0, 200),
      email: email.trim().toLowerCase().slice(0, 200),
      message: message.trim().slice(0, 2000),
    });

    // Forward to support email
    await resend.emails.send({
      from: "GetJobQuotes <hello@getjobquotes.uk>",
      to: "hello@getjobquotes.uk",
      subject: `New contact form message from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message}</p>`,
    }).catch(() => {});

    // Auto-reply
    await resend.emails.send({
      from: "GetJobQuotes <hello@getjobquotes.uk>",
      to: email,
      subject: "We got your message — GetJobQuotes",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#09090b;color:#fff;border-radius:16px;">
        <h2 style="color:#22c55e;">Thanks, ${name}!</h2>
        <p style="color:#a1a1aa;">We received your message and will get back to you within a few hours.</p>
        <p style="color:#a1a1aa;">In the meantime, check out our <a href="${APP_URL}/help" style="color:#22c55e;">Help Centre</a>.</p>
        <p style="color:#52525b;font-size:12px;margin-top:24px;">GetJobQuotes · hello@getjobquotes.uk</p>
      </div>`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
