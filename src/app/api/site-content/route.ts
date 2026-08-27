import { NextResponse } from "next/server";

import { defaultHomepageContent, defaultShippingPlanContent, normalizeHomepageContent, normalizeShippingPlanContent } from "@/lib/admin/website";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  let adminClient;

  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ homepage: defaultHomepageContent, shippingPlan: defaultShippingPlanContent }, { status: 200 });
  }

  const [homepageResult, shippingPlanResult] = await Promise.all([
    adminClient.from("site_content").select("content").eq("key", "homepage").maybeSingle(),
    adminClient.from("site_content").select("content").eq("key", "shipping").maybeSingle(),
  ]);

  const { data: homepageData, error: homepageError } = homepageResult;
  const { data: shippingPlanData, error: shippingPlanError } = shippingPlanResult;

  if (homepageError || shippingPlanError) {
    return NextResponse.json({ homepage: defaultHomepageContent, shippingPlan: defaultShippingPlanContent }, { status: 200 });
  }

  return NextResponse.json({
    homepage: normalizeHomepageContent((homepageData?.content ?? {}) as Partial<typeof defaultHomepageContent>),
    shippingPlan: normalizeShippingPlanContent((shippingPlanData?.content ?? {}) as Partial<typeof defaultShippingPlanContent>),
  });
}
