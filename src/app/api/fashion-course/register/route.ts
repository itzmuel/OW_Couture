import { NextResponse } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FashionCourseRegistrationRequest = {
  fullName?: string;
  email?: string;
  phone?: string;
  experienceLevel?: string;
  interestReason?: string;
  preferredContactMethod?: string;
  wantsMaterialsKit?: boolean;
};

const courseDepositFeeCents = 5000;
const materialsKitFeeCents = 30000;

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
  const wantsMaterialsKit = payload.wantsMaterialsKit === true;

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

  const { data: registration, error: insertError } = await adminClient
    .from("fashion_course_registrations")
    .insert({
      full_name: fullName,
      email,
      phone,
      experience_level: experienceLevel,
      interest_reason: interestReason,
      preferred_contact_method: preferredContactMethod,
      cohort_label: "October 2026",
      registration_deadline: "2026-09-30",
      course_start_date: "2026-10-01",
      wants_materials_kit: wantsMaterialsKit,
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (insertError || !registration) {
    return NextResponse.json({ message: insertError?.message ?? "Unable to create registration." }, { status: 500 });
  }

  try {
    const stripe = getStripeServerClient();
    const baseUrl = getBaseUrl(request);
    const totalAmountCents = wantsMaterialsKit
      ? courseDepositFeeCents + materialsKitFeeCents
      : courseDepositFeeCents;

    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: courseDepositFeeCents,
          product_data: {
            name: "OW Fashion Course Registration Deposit",
            description: "Deposit required to unlock the Basic Skills Assessment",
          },
        },
      },
    ];

    if (wantsMaterialsKit) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: materialsKitFeeCents,
          product_data: {
            name: "Course Materials Package",
            description: "Optional complete materials and fabrics package",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: registration.id,
      metadata: {
        source: "fashion-course",
        registrationId: registration.id,
        cohort: "October 2026",
        wantsMaterialsKit: wantsMaterialsKit ? "yes" : "no",
        expectedTotalCents: String(totalAmountCents),
      },
      line_items: lineItems,
      success_url: `${baseUrl}/fashion-course/assessment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/fashion-course?course_payment=cancelled&registration_id=${registration.id}`,
    });

    if (!session.url) {
      return NextResponse.json({ message: "Unable to create checkout session." }, { status: 500 });
    }

    const { error: updateError } = await adminClient
      .from("fashion_course_registrations")
      .update({
        stripe_checkout_session_id: session.id,
        payment_amount_cents: totalAmountCents,
        payment_status: "checkout-created",
      })
      .eq("id", registration.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
