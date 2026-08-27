import { NextResponse } from "next/server";

import { ensureAdminUser } from "@/lib/supabase/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FashionCourseRegistrationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  experience_level: string;
  interest_reason: string;
  preferred_contact_method: string;
  cohort_label: string;
  registration_deadline: string;
  course_start_date: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  wants_materials_kit: boolean;
  payment_amount_cents: number;
  assessment_answers: Record<string, string> | null;
  assessment_score: number | null;
  created_at: string;
};

type FashionCourseRetestRow = {
  id: string;
  payment_status: "new" | "contacted" | "enrolled" | "closed" | "paid" | string;
  assessment_answers: Record<string, string> | null;
  assessment_score: number | null;
};

export async function GET() {
  const adminCheck = await ensureAdminUser("consultations:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("fashion_course_registrations")
    .select(
      "id,full_name,email,phone,experience_level,interest_reason,preferred_contact_method,cohort_label,registration_deadline,course_start_date,status,wants_materials_kit,payment_amount_cents,assessment_answers,assessment_score,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ registrations: (data ?? []) as FashionCourseRegistrationRow[] });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("consultations:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  let payload: { id?: string };

  try {
    payload = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const registrationId = payload.id?.trim() ?? "";
  if (!registrationId) {
    return NextResponse.json({ message: "id is required." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data: existingRegistration, error: lookupError } = await adminClient
    .from("fashion_course_registrations")
    .select("id,payment_status,assessment_answers,assessment_score")
    .eq("id", registrationId)
    .maybeSingle();

  if (lookupError || !existingRegistration) {
    return NextResponse.json({ message: lookupError?.message ?? "Registration not found." }, { status: 404 });
  }

  const retestRegistration = existingRegistration as FashionCourseRetestRow;

  if (retestRegistration.payment_status !== "paid") {
    return NextResponse.json({ message: "Retest can only be enabled for paid registrations." }, { status: 400 });
  }

  const { error: updateError } = await adminClient
    .from("fashion_course_registrations")
    .update({
      assessment_answers: {},
      assessment_score: 0,
    })
    .eq("id", registrationId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
