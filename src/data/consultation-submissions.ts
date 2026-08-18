import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type ConsultationStatus = "new" | "in-progress" | "confirmed";

export type ConsultationSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  consultationType: string;
  request: string;
  submittedAt: string;
  status: ConsultationStatus;
  userId: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentStatus?: "unpaid" | "checkout-created" | "paid" | "cancelled" | "failed";
  consultationFeeAmountCents?: number;
  paidAt?: string | null;
};

export type ConsultationSubmissionInput = Omit<
  ConsultationSubmission,
  "id" | "submittedAt" | "status"
>;

type ConsultationSubmissionRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  requested_date: string | null;
  requested_time: string | null;
  consultation_type: string;
  request: string;
  status: ConsultationStatus;
  stripe_checkout_session_id?: string | null;
  stripe_payment_status?: "unpaid" | "checkout-created" | "paid" | "cancelled" | "failed";
  consultation_fee_amount_cents?: number | null;
  paid_at?: string | null;
  created_at: string;
};

function mapRowToSubmission(row: ConsultationSubmissionRow): ConsultationSubmission {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    date: row.requested_date ?? "",
    time: row.requested_time ?? "",
    consultationType: row.consultation_type,
    request: row.request,
    status: row.status,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? null,
    stripePaymentStatus: row.stripe_payment_status ?? "unpaid",
    consultationFeeAmountCents: row.consultation_fee_amount_cents ?? 5000,
    paidAt: row.paid_at ?? null,
    submittedAt: row.created_at,
  };
}

export async function addConsultationSubmission(input: ConsultationSubmissionInput) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("consultation_submissions")
    .insert({
      user_id: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      requested_date: input.date || null,
      requested_time: input.time || null,
      consultation_type: input.consultationType,
      request: input.request,
    })
    .select("id,user_id,name,email,phone,requested_date,requested_time,consultation_type,request,status,stripe_checkout_session_id,stripe_payment_status,consultation_fee_amount_cents,paid_at,created_at")
    .single();

  if (error || !data) {
    return {
      ok: false as const,
      message: error?.message ?? "Unable to submit consultation request.",
    };
  }

  return {
    ok: true as const,
    submission: mapRowToSubmission(data),
  };
}