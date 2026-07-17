import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type AllowedStatus = "new" | "in-progress" | "confirmed";

export async function GET() {
  const authResult = await ensureAdminUser();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("consultation_submissions")
    .select("id,user_id,name,email,phone,requested_date,requested_time,consultation_type,request,status,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}

export async function PATCH(request: Request) {
  const authResult = await ensureAdminUser();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const payload = (await request.json()) as {
    id?: string;
    status?: AllowedStatus;
  };

  if (!payload.id || !payload.status) {
    return NextResponse.json({ message: "Both id and status are required." }, { status: 400 });
  }

  const allowedStatuses: AllowedStatus[] = ["new", "in-progress", "confirmed"];
  if (!allowedStatuses.includes(payload.status)) {
    return NextResponse.json({ message: "Invalid status value." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("consultation_submissions")
    .update({ status: payload.status })
    .eq("id", payload.id)
    .select("id,user_id,name,email,phone,requested_date,requested_time,consultation_type,request,status,created_at")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ submission: data });
}
