import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Receives sendBeacon payload on tab close. Service role bypasses RLS
// but we still scope strictly to the userId sent.
export async function POST(req: NextRequest) {
  try {
    const { userId, draft } = await req.json();
    if (!userId || !draft) return NextResponse.json({ ok: false }, { status: 400 });
    await supabaseAdmin
      .from("quote_drafts")
      .upsert({ user_id: userId, draft }, { onConflict: "user_id" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
