import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RecoverAccessRequest = {
  email?: string;
};

type RecoveryRateLimitRow = {
  identifier: string;
  attempt_count: number;
  window_started_at: string;
  last_attempt_at: string;
  blocked_until: string | null;
};

type RegistrationRow = {
  id: string;
  email: string;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  wants_materials_kit: boolean;
  payment_amount_cents: number;
  paid_at: string | null;
  assessment_answers: Record<string, string> | null;
  assessment_score: number | null;
};

const courseDepositFeeCents = 5000;
const materialsKitFeeCents = 30000;
const cooldownMs = 20_000;
const rollingWindowMs = 10 * 60_000;
const maxAttemptsPerWindow = 8;
const blockMs = 15 * 60_000;

function hashIdentifier(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

async function enforceRateLimit(adminClient: ReturnType<typeof createSupabaseAdminClient>, identifier: string) {
  const now = new Date();

  const { data, error } = await adminClient
    .from("fashion_course_recovery_rate_limits")
    .select("identifier,attempt_count,window_started_at,last_attempt_at,blocked_until")
    .eq("identifier", identifier)
    .maybeSingle();

  if (error) {
    return {
      allowed: false,
      retryAfterSeconds: 30,
      message: "Please wait a moment before trying again.",
    };
  }

  const current = data as RecoveryRateLimitRow | null;

  if (!current) {
    const { error: insertError } = await adminClient.from("fashion_course_recovery_rate_limits").insert({
      identifier,
      attempt_count: 1,
      window_started_at: now.toISOString(),
      last_attempt_at: now.toISOString(),
      blocked_until: null,
    });

    if (insertError) {
      return {
        allowed: false,
        retryAfterSeconds: 30,
        message: "Please wait a moment before trying again.",
      };
    }

    return { allowed: true };
  }

  if (current.blocked_until) {
    const blockedUntilDate = new Date(current.blocked_until);
    if (blockedUntilDate.getTime() > now.getTime()) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((blockedUntilDate.getTime() - now.getTime()) / 1000)),
        message: "Too many attempts. Please try again later.",
      };
    }
  }

  const lastAttemptDate = new Date(current.last_attempt_at);
  const cooldownRemainingMs = cooldownMs - (now.getTime() - lastAttemptDate.getTime());

  if (cooldownRemainingMs > 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(cooldownRemainingMs / 1000)),
      message: "Please wait briefly before trying again.",
    };
  }

  const windowStartDate = new Date(current.window_started_at);
  const isWithinWindow = now.getTime() - windowStartDate.getTime() <= rollingWindowMs;
  const nextAttemptCount = isWithinWindow ? current.attempt_count + 1 : 1;
  const nextWindowStart = isWithinWindow ? current.window_started_at : now.toISOString();
  const shouldBlock = nextAttemptCount > maxAttemptsPerWindow;
  const nextBlockedUntil = shouldBlock ? new Date(now.getTime() + blockMs).toISOString() : null;

  const { error: updateError } = await adminClient
    .from("fashion_course_recovery_rate_limits")
    .update({
      attempt_count: nextAttemptCount,
      window_started_at: nextWindowStart,
      last_attempt_at: now.toISOString(),
      blocked_until: nextBlockedUntil,
      updated_at: now.toISOString(),
    })
    .eq("identifier", identifier);

  if (updateError) {
    return {
      allowed: false,
      retryAfterSeconds: 30,
      message: "Please wait a moment before trying again.",
    };
  }

  if (shouldBlock) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(blockMs / 1000)),
      message: "Too many attempts. Please try again later.",
    };
  }

  return { allowed: true };
}

function buildReceipt(row: RegistrationRow) {
  const amountTotalCents =
    row.payment_amount_cents > 0
      ? row.payment_amount_cents
      : row.wants_materials_kit
        ? courseDepositFeeCents + materialsKitFeeCents
        : courseDepositFeeCents;

  return {
    checkoutSessionId: row.stripe_checkout_session_id ?? "Not available",
    currency: "CAD",
    amountTotalCents,
    lineItems: [
      { label: "Course registration deposit", amountCents: courseDepositFeeCents },
      ...(row.wants_materials_kit ? [{ label: "Optional materials package", amountCents: materialsKitFeeCents }] : []),
    ],
    refundPolicy:
      "If you opt out before the course starts, only the optional C$300 materials package is refundable when paid.",
  };
}

export async function POST(request: Request) {
  let payload: RecoverAccessRequest;

  try {
    payload = (await request.json()) as RecoverAccessRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() ?? "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const ipHash = hashIdentifier(`ip:${getClientIp(request)}`);
  const emailHash = hashIdentifier(`email:${email}`);

  const ipRateLimit = await enforceRateLimit(adminClient, ipHash);
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      {
        verified: false,
        message: ipRateLimit.message,
        retryAfterSeconds: ipRateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipRateLimit.retryAfterSeconds ?? 30),
        },
      },
    );
  }

  const emailRateLimit = await enforceRateLimit(adminClient, emailHash);
  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      {
        verified: false,
        message: emailRateLimit.message,
        retryAfterSeconds: emailRateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(emailRateLimit.retryAfterSeconds ?? 30),
        },
      },
    );
  }

  const { data: rows, error } = await adminClient
    .from("fashion_course_registrations")
    .select(
      "id,email,payment_status,stripe_checkout_session_id,wants_materials_kit,payment_amount_cents,paid_at,assessment_answers,assessment_score,created_at",
    )
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ verified: false, message: "Unable to process your request right now." }, { status: 500 });
  }

  const registrations = (rows ?? []) as RegistrationRow[];
  if (registrations.length === 0) {
    return NextResponse.json(
      {
        verified: false,
        message: "If a paid registration exists for this email, your assessment access will be restored.",
      },
      { status: 200 },
    );
  }

  let target = registrations.find((row) => row.payment_status === "paid") ?? registrations[0];

  if (target.payment_status !== "paid" && target.stripe_checkout_session_id) {
    try {
      const stripe = getStripeServerClient();
      const session = await stripe.checkout.sessions.retrieve(target.stripe_checkout_session_id);

      if (session.payment_status === "paid") {
        const wantsMaterialsKit = session.metadata?.wantsMaterialsKit === "yes";
        const paymentAmountCents = session.amount_total ?? target.payment_amount_cents;

        const { error: updateError } = await adminClient
          .from("fashion_course_registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            wants_materials_kit: wantsMaterialsKit,
            payment_amount_cents: paymentAmountCents,
          })
          .eq("id", target.id);

        if (!updateError) {
          target = {
            ...target,
            payment_status: "paid",
            wants_materials_kit: wantsMaterialsKit,
            payment_amount_cents: paymentAmountCents,
            paid_at: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Keep fallback behavior with existing DB status if Stripe lookup fails.
    }
  }

  if (target.payment_status !== "paid") {
    return NextResponse.json(
      {
        verified: false,
        message: "If a paid registration exists for this email, your assessment access will be restored.",
      },
      { status: 200 },
    );
  }

  const assessmentCompleted =
    (target.assessment_score ?? 0) > 0 ||
    (target.assessment_answers !== null && Object.keys(target.assessment_answers).length > 0);

  return NextResponse.json(
    {
      verified: true,
      registrationId: target.id,
      assessmentCompleted,
      assessmentScore: target.assessment_score ?? 0,
      receipt: buildReceipt(target),
      message: assessmentCompleted
        ? "Payment found. Your assessment was already submitted."
        : "Payment found. Your assessment has been re-unlocked.",
    },
    { status: 200 },
  );
}
