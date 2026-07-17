import { NextResponse } from "next/server";

import { defaultHomepageContent, normalizeHomepageContent } from "@/lib/admin/website";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.from("site_content").select("content").eq("key", "homepage").maybeSingle();

  if (error) {
    return NextResponse.json({ homepage: defaultHomepageContent }, { status: 200 });
  }

  return NextResponse.json({ homepage: normalizeHomepageContent((data?.content ?? {}) as Partial<typeof defaultHomepageContent>) });
}
