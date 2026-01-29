import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let email = "";

    // Accept JSON
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = String(body?.email || "").trim().toLowerCase();
    }

    // Accept form-encoded
    if (!email && contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      email = String(form.get("email") || "").trim().toLowerCase();
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // For now: just log (next step we store to DB + send email)
    console.log("[lead]", { email, at: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
