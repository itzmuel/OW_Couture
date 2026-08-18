import { NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PaymentAuditStatus = "unpaid" | "checkout-created" | "paid" | "cancelled" | "failed";

function normalizePaymentStatus(sessionStatus: string | null, paymentStatus: string): PaymentAuditStatus {
  if (paymentStatus === "paid") {
    return "paid";
  }

  if (sessionStatus === "expired") {
    return "cancelled";
  }

  if (sessionStatus === "complete" && paymentStatus !== "paid") {
    return "failed";
  }

  return "checkout-created";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim();
  const submissionId = url.searchParams.get("submission")?.trim();
  const paymentState = url.searchParams.get("payment")?.trim();

  const adminClient = createSupabaseAdminClient();

  if (paymentState === "cancelled" && submissionId) {
    const { error } = await adminClient
      .from("consultation_submissions")
      .update({ stripe_payment_status: "cancelled" })
      .eq("id", submissionId)
      .neq("stripe_payment_status", "paid");

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "cancelled" as PaymentAuditStatus, verified: true });
  }

  if (!sessionId) {
    return NextResponse.json({ message: "session_id is required." }, { status: 400 });
  }

  try {
    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const resolvedSubmissionId =
      (session.metadata?.submissionId as string | undefined)?.trim() ||
      session.client_reference_id?.trim() ||
      "";

    if (!resolvedSubmissionId) {
      return NextResponse.json({ status: "failed" as PaymentAuditStatus, verified: false });
    }

    const nextStatus = normalizePaymentStatus(session.status, session.payment_status);
    const updatePayload: {
      stripe_checkout_session_id: string;
      stripe_payment_status: PaymentAuditStatus;
      paid_at?: string;
      status?: "confirmed";
    } = {
      stripe_checkout_session_id: session.id,
      stripe_payment_status: nextStatus,
    };

    if (nextStatus === "paid") {
      updatePayload.paid_at = new Date().toISOString();
      updatePayload.status = "confirmed";
    }

    const { error } = await adminClient
      .from("consultation_submissions")
      .update(updatePayload)
      .eq("id", resolvedSubmissionId);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: nextStatus, verified: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment session.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
