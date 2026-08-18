import { NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CheckoutRequest = {
  submissionId?: string;
  name?: string;
  email?: string;
};

const consultationFeeCents = 5000;

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configuredUrl?.startsWith("http://") || configuredUrl?.startsWith("https://")) {
    return configuredUrl;
  }

  const requestOrigin = request.headers.get("origin")?.trim();
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.trim() || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const normalizedHost = vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${normalizedHost}`;
  }

  return "http://localhost:3000";
}

export async function POST(request: Request) {
  let payload: CheckoutRequest;

  try {
    payload = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const submissionId = payload.submissionId?.trim();
  const customerName = payload.name?.trim() || "Client";
  const customerEmail = payload.email?.trim().toLowerCase();

  if (!submissionId || !customerEmail) {
    return NextResponse.json({ message: "submissionId and email are required." }, { status: 400 });
  }

  try {
    const stripe = getStripeServerClient();
    const baseUrl = getBaseUrl(request);
    const adminClient = createSupabaseAdminClient();

    const { data: existingSubmission, error: submissionError } = await adminClient
      .from("consultation_submissions")
      .select("id,email,stripe_payment_status")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError || !existingSubmission) {
      return NextResponse.json({ message: submissionError?.message ?? "Consultation request not found." }, { status: 404 });
    }

    if (existingSubmission.email.toLowerCase() !== customerEmail) {
      return NextResponse.json({ message: "Email does not match the consultation request." }, { status: 400 });
    }

    if (existingSubmission.stripe_payment_status === "paid") {
      return NextResponse.json({ message: "This consultation deposit has already been paid." }, { status: 409 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: submissionId,
      metadata: {
        submissionId,
        customerName,
        customerEmail,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "cad",
            unit_amount: consultationFeeCents,
            product_data: {
              name: "OW Couture Consultation Deposit",
              description: "Non-refundable consultation fee",
            },
          },
        },
      ],
      success_url: `${baseUrl}/consultation?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/consultation?payment=cancelled&submission=${submissionId}`,
    });

    if (!session.url) {
      return NextResponse.json({ message: "Unable to create checkout session." }, { status: 500 });
    }

    const { error: updateError } = await adminClient
      .from("consultation_submissions")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_status: "checkout-created",
        consultation_fee_amount_cents: consultationFeeCents,
      })
      .eq("id", submissionId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize payment session.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
