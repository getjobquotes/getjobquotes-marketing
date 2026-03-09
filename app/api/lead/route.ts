import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Insert into Supabase
    const { error } = await supabase.from("leads").insert({
      name,
      email,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send confirmation email
    await resend.emails.send({
      from: "GetJobQuotes <hello@getjobquotes.uk>",
      to: email,
      subject: "You're on the waiting list",
      html: `
        <h2>Hi ${name || "there"},</h2>
        <p>Thanks for joining the GetJobQuotes waiting list.</p>
        <p>We’ll notify you when we launch.</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
