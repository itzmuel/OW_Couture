import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Missing Stripe webhook configuration." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    return NextResponse.json({ message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submissionId ?? session.client_reference_id ?? "";

    if (submissionId) {
      const adminClient = createSupabaseAdminClient();
      const nextPaymentStatus = session.payment_status === "paid" ? "paid" : "failed";
      const nextConsultationStatus = session.payment_status === "paid" ? "confirmed" : "in-progress";
      await adminClient
        .from("consultation_submissions")
        .update({
          status: nextConsultationStatus,
          stripe_checkout_session_id: session.id,
          stripe_payment_status: nextPaymentStatus,
          paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
        })
        .eq("id", submissionId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submissionId ?? session.client_reference_id ?? "";

    if (submissionId) {
      const adminClient = createSupabaseAdminClient();
      await adminClient
        .from("consultation_submissions")
        .update({
          stripe_checkout_session_id: session.id,
          stripe_payment_status: "cancelled",
        })
        .eq("id", submissionId)
        .neq("stripe_payment_status", "paid");
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submissionId ?? session.client_reference_id ?? "";

    if (submissionId) {
      const adminClient = createSupabaseAdminClient();
      await adminClient
        .from("consultation_submissions")
        .update({
          stripe_checkout_session_id: session.id,
          stripe_payment_status: "failed",
        })
        .eq("id", submissionId)
        .neq("stripe_payment_status", "paid");
    }
  }

  return NextResponse.json({ received: true });
}
