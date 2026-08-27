"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentReceipt = {
  checkoutSessionId: string;
  currency: string;
  amountTotalCents: number;
  lineItems: Array<{ label: string; amountCents: number }>;
  refundPolicy: string;
};

const assessmentQuestions = [
  {
    key: "q1",
    prompt: "Which sentence is grammatically correct?",
    options: [
      "A. The measurements was taken yesterday",
      "B. The measurements were taken yesterday",
      "C. The measurement were taken yesterday",
      "D. The measurement was taken yesterday",
    ],
  },
  {
    key: "q2",
    prompt: "Rewrite the instruction: 'Cut along the dotted line.' What does this mean?",
    options: [
      "A. Cut anywhere you want",
      "B. Cut only the thick line",
      "C. Cut following the dotted guideline",
      "D. Do not cut the paper",
    ],
  },
  {
    key: "q3",
    prompt: "Which sentence best describes clear instructions?",
    options: [
      "A. Do it however you want.",
      "B. Cut the fabric, then sew it.",
      "C. Cut the fabric into two equal pieces, then sew the edges together.",
      "D. Cut something and sew something.",
    ],
  },
  {
    key: "q4",
    prompt: "A client says: 'Please make sure the final work is neat.' What does neat mean?",
    options: ["A. Very colorful", "B. Clean and tidy", "C. Very large", "D. Unfinished"],
  },
  {
    key: "q5",
    prompt: "Choose the sentence with correct spelling:",
    options: [
      "A. I need to recieve the order today",
      "B. I need to receive the order today",
      "C. I need to recive the order today",
      "D. I need to receeve the order today",
    ],
  },
  {
    key: "q6",
    prompt: "What is 2.5 x 6?",
    options: ["A. 12", "B. 13", "C. 15", "D. 18"],
  },
  {
    key: "q7",
    prompt: "A roll of ribbon is 48 meters long. Each dress uses 3 meters. How many dresses can you complete?",
    options: ["A. 12", "B. 14", "C. 15", "D. 16"],
  },
  {
    key: "q8",
    prompt: "Add the following: 18.75 + 6.5 + 3.25",
    options: ["A. 26.25", "B. 28.5", "C. 29.75", "D. 30.5"],
  },
  {
    key: "q9",
    prompt: "Subtract: 42.8 - 17.35",
    options: ["A. 24.45", "B. 25.55", "C. 26.35", "D. 27.45"],
  },
  {
    key: "q10",
    prompt: "Multiply: 14 x 3.5",
    options: ["A. 42", "B. 45", "C. 49", "D. 52"],
  },
] as const;

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function FashionCourseAssessmentPage() {
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecoveringAccess, setIsRecoveringAccess] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryState, setRecoveryState] = useState<"idle" | "success" | "error">("idle");

  const [isAssessmentSubmitting, setIsAssessmentSubmitting] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");
  const [assessmentState, setAssessmentState] = useState<"idle" | "success" | "error">("idle");

  const applyRecoveredAccess = (payload: {
    registrationId?: string;
    message?: string;
    receipt?: PaymentReceipt | null;
    assessmentCompleted?: boolean;
    assessmentScore?: number;
  }) => {
    if (!payload.registrationId) {
      return;
    }

    setRegistrationId(payload.registrationId);
    setIsPaymentVerified(true);
    setPaymentReceipt(payload.receipt ?? null);
    setPaymentNotice(payload.message ?? "Payment confirmed. Assessment unlocked.");

    if (payload.assessmentCompleted) {
      router.replace(`/fashion-course/assessment/after?score=${encodeURIComponent(String(payload.assessmentScore ?? 0))}`);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setPaymentNotice("Complete payment to unlock the assessment. If you've already paid, recover access below.");
      return;
    }

    setIsVerifyingPayment(true);
    setPaymentNotice("Verifying payment and unlocking your assessment...");

    void (async () => {
      const response = await fetch(`/api/fashion-course/payment-status?session_id=${encodeURIComponent(sessionId)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        verified?: boolean;
        registrationId?: string;
        message?: string;
        receipt?: PaymentReceipt | null;
        assessmentCompleted?: boolean;
        assessmentScore?: number;
      };

      if (!response.ok || !payload.verified || !payload.registrationId) {
        setPaymentNotice(payload.message ?? "Unable to verify payment yet. Please recover access below.");
        setIsVerifyingPayment(false);
        return;
      }

      applyRecoveredAccess(payload);
      setIsVerifyingPayment(false);
    })();
  }, []);

  return (
    <main className="relative border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-[980px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">OW Fashion Academy</p>
        <h1 className="mt-3 text-[clamp(30px,4vw,52px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
          Basic Skills Assessment
        </h1>
        <p className="mt-3 text-base leading-8 text-[var(--muted)] sm:text-lg">
          This assessment is only available after successful payment.
        </p>

        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            isPaymentVerified ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-white text-neutral-700"
          }`}
        >
          {paymentNotice || "Checking payment status..."}
        </p>

        {paymentReceipt ? (
          <article className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-800">Payment Receipt</p>
            <p className="mt-1 text-sm text-emerald-900">Session: {paymentReceipt.checkoutSessionId}</p>
            <div className="mt-3 space-y-2 text-sm text-emerald-900">
              {paymentReceipt.lineItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span>{formatCad(item.amountCents)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-emerald-200 pt-2 font-semibold">
                <span>Total Paid</span>
                <span>{formatCad(paymentReceipt.amountTotalCents)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-emerald-800">{paymentReceipt.refundPolicy}</p>
          </article>
        ) : null}

        {!isPaymentVerified ? (
          <form
            className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setRecoveryState("idle");
              setRecoveryMessage("");
              setIsRecoveringAccess(true);

              const response = await fetch("/api/fashion-course/recover-access", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: recoveryEmail.trim() }),
              });

              const payload = (await response.json()) as {
                verified?: boolean;
                registrationId?: string;
                message?: string;
                receipt?: PaymentReceipt | null;
                assessmentCompleted?: boolean;
                retryAfterSeconds?: number;
              };

              if (!response.ok || !payload.verified || !payload.registrationId) {
                setRecoveryState("error");
                if (response.status === 429 && payload.retryAfterSeconds) {
                  setRecoveryMessage(`${payload.message ?? "Too many attempts."} Try again in ${payload.retryAfterSeconds} seconds.`);
                } else {
                  setRecoveryMessage(payload.message ?? "Could not recover access with that email.");
                }
                setIsRecoveringAccess(false);
                return;
              }

              applyRecoveredAccess(payload);
              setRecoveryState("success");
              setRecoveryMessage(payload.message ?? "Payment found. Assessment unlocked.");
              setIsRecoveringAccess(false);
            }}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Already paid?</p>
            <p className="mt-1 text-sm text-neutral-700">
              If you refreshed or lost the return link, enter the same payment email to re-unlock your assessment.
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={recoveryEmail}
                onChange={(event) => setRecoveryEmail(event.target.value)}
                placeholder="Enter your payment email"
                required
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              />
              <button
                type="submit"
                disabled={isRecoveringAccess || isVerifyingPayment}
                className="rounded-full border border-black px-5 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRecoveringAccess ? "Checking..." : "Re-Unlock"}
              </button>
            </div>

            {recoveryState === "error" ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{recoveryMessage}</p>
            ) : null}

            {recoveryState === "success" ? (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{recoveryMessage}</p>
            ) : null}
          </form>
        ) : null}

        {isPaymentVerified ? (
          <section className="mt-6 rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Step 2: Basic Skills Assessment</p>
            <h2 className="mt-3 text-[clamp(28px,3.6vw,44px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
              10-question multiple choice test
            </h2>

            <form
              className="mt-5 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();

                if (!registrationId) {
                  setAssessmentState("error");
                  setAssessmentMessage("Missing registration reference. Please complete payment again.");
                  return;
                }

                setAssessmentState("idle");
                setAssessmentMessage("");
                setIsAssessmentSubmitting(true);

                const formData = new FormData(event.currentTarget);
                const assessmentAnswers = assessmentQuestions.reduce<Record<string, string>>((answers, question) => {
                  answers[question.key] = String(formData.get(question.key) ?? "").trim();
                  return answers;
                }, {});

                const response = await fetch("/api/fashion-course/assessment", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    registrationId,
                    assessmentAnswers,
                  }),
                });

                const payload = (await response.json()) as {
                  message?: string;
                  assessmentCompleted?: boolean;
                  assessmentScore?: number;
                };

                if (!response.ok) {
                  if (response.status === 409 && payload.assessmentCompleted) {
                    router.replace(`/fashion-course/assessment/after?score=${encodeURIComponent(String(payload.assessmentScore ?? 0))}`);
                    setIsAssessmentSubmitting(false);
                    return;
                  }

                  setAssessmentState("error");
                  setAssessmentMessage(payload.message ?? "Unable to submit assessment right now.");
                  setIsAssessmentSubmitting(false);
                  return;
                }

                router.replace(`/fashion-course/assessment/after?score=${encodeURIComponent(String(payload.assessmentScore ?? 0))}`);
                setIsAssessmentSubmitting(false);
              }}
            >
              <div className="grid gap-4">
                {assessmentQuestions.map((question, index) => (
                  <fieldset key={question.key} className="rounded-2xl border border-[var(--line)] p-4" disabled={isAssessmentSubmitting}>
                    <legend className="px-1 text-sm font-medium text-neutral-900">
                      {index + 1}. {question.prompt}
                    </legend>
                    <div className="mt-3 grid gap-2 text-sm text-neutral-800">
                      {question.options.map((option) => {
                        const optionValue = option.slice(0, 1);

                        return (
                          <label key={`${question.key}-${optionValue}`} className="flex cursor-pointer items-start gap-2">
                            <input type="radio" name={question.key} value={optionValue} required className="mt-1" />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {assessmentState === "error" ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{assessmentMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isAssessmentSubmitting}
                className="w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isAssessmentSubmitting ? "Submitting..." : "Submit Assessment"}
              </button>
            </form>
          </section>
        ) : null}
      </section>
    </main>
  );
}
