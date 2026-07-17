import { NextResponse } from "next/server";

import { normalizeHomepageContent, type HomepageContent } from "@/lib/admin/website";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export async function GET() {
  const adminCheck = await ensureAdminUser("website:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.from("site_content").select("content").eq("key", "homepage").maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ homepage: normalizeHomepageContent((data?.content ?? {}) as Partial<HomepageContent>) });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("website:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as { homepage?: Partial<HomepageContent> };
  const homepage = normalizeHomepageContent(payload.homepage);

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("site_content").upsert({
    key: "homepage",
    content: homepage,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ homepage });
}
