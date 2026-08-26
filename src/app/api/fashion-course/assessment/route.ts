import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AssessmentRequest = {
  registrationId?: string;
  assessmentAnswers?: Record<string, string>;
};

const answerKey: Record<string, string> = {
  q1: "B",
  q2: "C",
  q3: "C",
  q4: "B",
  q5: "B",
  q6: "C",
  q7: "D",
  q8: "B",
  q9: "B",
  q10: "C",
};

export async function POST(request: Request) {
  let payload: AssessmentRequest;

  try {
    payload = (await request.json()) as AssessmentRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const registrationId = payload.registrationId?.trim() ?? "";
  const assessmentAnswers = payload.assessmentAnswers ?? {};

  if (!registrationId) {
    return NextResponse.json({ message: "registrationId is required." }, { status: 400 });
  }

  const questionKeys = Object.keys(answerKey);
  const allowedOptions = ["A", "B", "C", "D"];

  const missingAnswer = questionKeys.find((key) => {
    const value = assessmentAnswers[key];
    return typeof value !== "string" || !allowedOptions.includes(value);
  });

  if (missingAnswer) {
    return NextResponse.json({ message: "Please complete all assessment questions." }, { status: 400 });
  }

  const assessmentScore = questionKeys.reduce((score, key) => {
    return score + (assessmentAnswers[key] === answerKey[key] ? 1 : 0);
  }, 0);

  const adminClient = createSupabaseAdminClient();

  const { data: registration, error: registrationError } = await adminClient
    .from("fashion_course_registrations")
    .select("id,payment_status")
    .eq("id", registrationId)
    .maybeSingle();

  if (registrationError || !registration) {
    return NextResponse.json({ message: registrationError?.message ?? "Registration not found." }, { status: 404 });
  }

  if (registration.payment_status !== "paid") {
    return NextResponse.json({ message: "Assessment unlocks only after successful payment." }, { status: 400 });
  }

  const { error: updateError } = await adminClient
    .from("fashion_course_registrations")
    .update({
      assessment_answers: assessmentAnswers,
      assessment_score: assessmentScore,
    })
    .eq("id", registrationId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Assessment submitted successfully. Score: ${assessmentScore}/10.` }, { status: 200 });
}
