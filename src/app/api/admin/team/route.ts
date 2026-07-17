import { NextResponse } from "next/server";

import type { AdminTeamMember } from "@/lib/admin/team";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type TeamRow = {
  email: string;
  full_name: string;
  role: AdminTeamMember["role"];
  permissions: string[];
  active: boolean;
};

function toTeamMember(row: TeamRow): AdminTeamMember {
  return {
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    permissions: row.permissions ?? [],
    active: row.active,
  };
}

export async function GET() {
  const adminCheck = await ensureAdminUser("team:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.from("admin_team_members").select("email,full_name,role,permissions,active").order("full_name", { ascending: true });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: ((data ?? []) as TeamRow[]).map(toTeamMember) });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminUser("team:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as AdminTeamMember;
  if (!payload.email || !payload.fullName || !payload.role) {
    return NextResponse.json({ message: "email, fullName, and role are required." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("admin_team_members").upsert({
    email: payload.email.toLowerCase(),
    full_name: payload.fullName,
    role: payload.role,
    permissions: payload.permissions,
    active: payload.active,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
