import { NextRequest, NextResponse } from "next/server";

// Auth is handled client-side via useAuthGuard.
// This proxy passes all requests through unchanged.
export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
