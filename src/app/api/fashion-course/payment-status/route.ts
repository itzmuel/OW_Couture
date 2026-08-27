import { NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RegistrationRow = {
  assessment_answers: Record<string, string> | null;
  assessment_score: number | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return NextResponse.json({ message: "session_id is required." }, { status: 400 });
  }

  try {
    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const registrationId = session.metadata?.registrationId ?? session.client_reference_id ?? "";
    if (!registrationId) {
      return NextResponse.json({ message: "Registration reference is missing from checkout session." }, { status: 400 });
    }

    const isPaid = session.payment_status === "paid";
    const wantsMaterialsKit = session.metadata?.wantsMaterialsKit === "yes";
    const amountTotalCents = session.amount_total ?? 0;
    const adminClient = createSupabaseAdminClient();

    const { data: registrationData, error: registrationError } = await adminClient
      .from("fashion_course_registrations")
      .select("assessment_answers,assessment_score")
      .eq("id", registrationId)
      .maybeSingle();

    if (registrationError) {
      return NextResponse.json({ message: registrationError.message }, { status: 500 });
    }

    const registration = (registrationData ?? null) as RegistrationRow | null;
    const assessmentCompleted =
      (registration?.assessment_score ?? 0) > 0 ||
      (registration?.assessment_answers !== null && Object.keys(registration?.assessment_answers ?? {}).length > 0);

    const { error: updateError } = await adminClient
      .from("fashion_course_registrations")
      .update({
        stripe_checkout_session_id: session.id,
        wants_materials_kit: wantsMaterialsKit,
        payment_amount_cents: amountTotalCents,
        payment_status: isPaid ? "paid" : "checkout-created",
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .eq("id", registrationId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      verified: isPaid,
      registrationId,
      assessmentCompleted,
      assessmentScore: registration?.assessment_score ?? 0,
      receipt: isPaid
        ? {
            checkoutSessionId: session.id,
            currency: (session.currency ?? "cad").toUpperCase(),
            amountTotalCents,
            lineItems: [
              { label: "Course registration deposit", amountCents: 5000 },
              ...(wantsMaterialsKit ? [{ label: "Optional materials package", amountCents: 30000 }] : []),
            ],
            refundPolicy:
              "If you opt out before the course starts, only the optional C$300 materials package is refundable when paid.",
          }
        : null,
      message: isPaid
        ? "Payment confirmed. Your assessment is now unlocked."
        : "Payment is not complete yet.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment status.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
