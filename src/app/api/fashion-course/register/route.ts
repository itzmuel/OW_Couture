import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FashionCourseRegistrationRequest = {
  fullName?: string;
  email?: string;
  phone?: string;
  experienceLevel?: string;
  interestReason?: string;
  preferredContactMethod?: string;
};

export async function POST(request: Request) {
  let payload: FashionCourseRegistrationRequest;

  try {
    payload = (await request.json()) as FashionCourseRegistrationRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const fullName = payload.fullName?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const experienceLevel = payload.experienceLevel?.trim() ?? "";
  const interestReason = payload.interestReason?.trim() ?? "";
  const preferredContactMethod = payload.preferredContactMethod?.trim() ?? "";

  if (!fullName || !email || !phone || !experienceLevel || !interestReason || !preferredContactMethod) {
    return NextResponse.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  const allowedContactMethods = ["Email", "Phone", "WhatsApp"];
  if (!allowedContactMethods.includes(preferredContactMethod)) {
    return NextResponse.json({ message: "Invalid contact method selected." }, { status: 400 });
  }

  let adminClient;

  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return NextResponse.json(
      { message: "Registration is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const { error } = await adminClient.from("fashion_course_registrations").insert({
    full_name: fullName,
    email,
    phone,
    experience_level: experienceLevel,
    interest_reason: interestReason,
    preferred_contact_method: preferredContactMethod,
    cohort_label: "October 2026",
    registration_deadline: "2026-09-30",
    course_start_date: "2026-10-01",
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Registration received. We will contact you shortly." }, { status: 200 });
}
