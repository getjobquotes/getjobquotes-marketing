import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, to, name, quoteNumber, invoiceNumber, total, description, businessName } = body;

  try {
    if (type === "welcome") {
      await resend.emails.send({
        from: "GetJobQuotes <hello@getjobquotes.uk>",
        to,
        subject: "Welcome to GetJobQuotes",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Welcome to GetJobQuotes</h1>
            <p style="color:#a1a1aa;margin-bottom:24px;">Your account is ready. Start creating professional quotes in minutes.</p>
            <a href="https://getjobquotes.uk/tool" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Create Your First Quote</a>
            <p style="color:#52525b;font-size:12px;margin-top:32px;">GetJobQuotes.uk — Built for UK trades</p>
          </div>
        `,
      });
    }

    if (type === "quote_saved") {
      await resend.emails.send({
        from: "GetJobQuotes <hello@getjobquotes.uk>",
        to,
        subject: `Quote ${quoteNumber} saved`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Quote Saved</h1>
            <p style="color:#a1a1aa;">Your quote <strong style="color:#fff;">${quoteNumber}</strong> has been saved.</p>
            <div style="background:#18181b;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 4px;">Total</p>
              <p style="color:#22c55e;font-size:28px;font-weight:700;margin:0;">£${total}</p>
            </div>
            <a href="https://getjobquotes.uk/dashboard" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Dashboard</a>
          </div>
        `,
      });
    }

    if (type === "send_quote") {
      await resend.emails.send({
        from: "GetJobQuotes <hello@getjobquotes.uk>",
        to,
        subject: `Quote from ${businessName} — ${quoteNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">You have a new quote</h1>
            <p style="color:#a1a1aa;">Hi ${name},</p>
            <p style="color:#a1a1aa;">${businessName} has sent you a quote for the following work:</p>
            <div style="background:#18181b;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px;">Job Description</p>
              <p style="color:#fff;margin:0 0 16px;">${description}</p>
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 4px;">Total</p>
              <p style="color:#22c55e;font-size:28px;font-weight:700;margin:0;">£${total}</p>
            </div>
            <p style="color:#52525b;font-size:12px;margin-top:32px;">Quote ref: ${quoteNumber}</p>
          </div>
        `,
      });
    }

    if (type === "send_invoice") {
      await resend.emails.send({
        from: "GetJobQuotes <hello@getjobquotes.uk>",
        to,
        subject: `Invoice from ${businessName} — ${invoiceNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px;">Invoice</h1>
            <p style="color:#a1a1aa;">Hi ${name},</p>
            <p style="color:#a1a1aa;">Please find your invoice from ${businessName} below.</p>
            <div style="background:#18181b;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px;">Description</p>
              <p style="color:#fff;margin:0 0 16px;">${description}</p>
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 4px;">Amount Due</p>
              <p style="color:#22c55e;font-size:28px;font-weight:700;margin:0;">£${total}</p>
            </div>
            <p style="color:#a1a1aa;font-size:13px;">Payment due within 30 days.</p>
            <p style="color:#52525b;font-size:12px;margin-top:32px;">Invoice ref: ${invoiceNumber}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
