import { NextResponse } from "next/server";

import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export async function GET() {
  const adminCheck = await ensureAdminUser();

  if (!adminCheck.ok) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }

  return NextResponse.json({ isAdmin: true }, { status: 200 });
}
