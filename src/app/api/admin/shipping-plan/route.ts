import { NextResponse } from "next/server";

import { defaultShippingPlanContent, normalizeShippingPlanContent, type ShippingPlanContent } from "@/lib/admin/website";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export async function GET() {
  const adminCheck = await ensureAdminUser("settings:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  let adminClient;

  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ shippingPlan: defaultShippingPlanContent }, { status: 200 });
  }

  const { data, error } = await adminClient.from("site_content").select("content").eq("key", "shipping").maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ shippingPlan: normalizeShippingPlanContent((data?.content ?? {}) as Partial<ShippingPlanContent>) });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("settings:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as { shippingPlan?: Partial<ShippingPlanContent> };
  const shippingPlan = normalizeShippingPlanContent(payload.shippingPlan);

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("site_content").upsert({
    key: "shipping",
    content: shippingPlan,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ shippingPlan });
}