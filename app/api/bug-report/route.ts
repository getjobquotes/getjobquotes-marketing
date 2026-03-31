import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { success } = rateLimit(user.id, "bug-report");
    if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { message, page_url } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

    await supabase.from("bug_reports").insert({
      user_id: user.id,
      message: message.trim().slice(0, 2000),
      page_url: page_url?.slice(0, 500) || null,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
