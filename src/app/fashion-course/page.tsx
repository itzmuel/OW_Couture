"use client";

import { useEffect, useMemo, useState } from "react";

const courseDepositFeeCents = 5000;
const materialsKitFeeCents = 30000;

const learningOutcomes = [
  "Draft basic patterns from scratch.",
  "Understand and apply dart manipulation techniques.",
  "Construct a structured corset using professional methods.",
  "Complete one final project that demonstrates craftsmanship and creativity.",
];

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

type PaymentReceipt = {
  checkoutSessionId: string;
  currency: string;
  amountTotalCents: number;
  lineItems: Array<{ label: string; amountCents: number }>;
  refundPolicy: string;
};

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function FashionCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [registrationId, setRegistrationId] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [isAssessmentSubmitting, setIsAssessmentSubmitting] = useState(false);
  const [assessmentMessage, setAssessmentMessage] = useState("");
  const [assessmentState, setAssessmentState] = useState<"idle" | "success" | "error">("idle");
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [wantsMaterialsKit, setWantsMaterialsKit] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecoveringAccess, setIsRecoveringAccess] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryState, setRecoveryState] = useState<"idle" | "success" | "error">("idle");

  const totalPayableCents = useMemo(() => {
    return wantsMaterialsKit ? courseDepositFeeCents + materialsKitFeeCents : courseDepositFeeCents;
  }, [wantsMaterialsKit]);

  const applyRecoveredAccess = (payload: {
    registrationId?: string;
    message?: string;
    receipt?: PaymentReceipt | null;
    assessmentCompleted?: boolean;
  }) => {
    if (!payload.registrationId) {
      return;
    }

    setRegistrationId(payload.registrationId);
    setIsPaymentVerified(true);
    setPaymentReceipt(payload.receipt ?? null);
    setPaymentNotice(payload.message ?? "Payment confirmed. Assessment unlocked.");

    if (payload.assessmentCompleted) {
      setAssessmentState("success");
      setAssessmentMessage("Assessment already submitted for this registration.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentState = params.get("course_payment");
    const sessionId = params.get("session_id");

    if (paymentState === "cancelled") {
      setPaymentNotice("Payment was cancelled. Complete payment to unlock the assessment.");
      return;
    }

    if (paymentState === "success" && sessionId) {
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
        };

        if (!response.ok || !payload.verified || !payload.registrationId) {
          setPaymentNotice(payload.message ?? "Unable to verify payment yet. Please refresh in a moment.");
          setIsVerifyingPayment(false);
          return;
        }

        applyRecoveredAccess(payload);
        setIsVerifyingPayment(false);
      })();
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollHint(window.scrollY < 200);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="relative border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">OW Fashion Academy</p>
        <h1 className="mt-3 max-w-5xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
          8-Week Introductory Garment Construction Course
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)] sm:text-lg">
          This 8-week course is built for absolute beginners who want to step confidently into garment construction.
          Through hands-on learning, guided demonstrations, and structured weekly lessons, students build a strong
          foundation in pattern drafting, dart manipulation, and corset construction, then complete one final project.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-black px-4 py-2">Classes begin October 2026</span>
          <span className="rounded-full border border-black bg-black px-4 py-2 text-white">Registration closes September 30, 2026</span>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--line)] bg-white p-6 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">What You Will Learn</p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-800 sm:text-base">
              {learningOutcomes.map((item) => (
                <li key={item} className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[28px] border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Course Details</p>
            <div className="mt-4 grid gap-3 text-sm text-neutral-800">
              <p><b>Duration:</b> 8 weeks</p>
              <p><b>Start:</b> October 2026</p>
              <p><b>Deadline:</b> September 30, 2026</p>
              <p><b>Level:</b> Beginner-friendly</p>
              <p><b>Location:</b> OW Couture Studio</p>
              <p><b>Schedule:</b> Shared after registration review</p>
              <p><b>Base Fee:</b> {formatCad(courseDepositFeeCents)}</p>
              <p><b>Optional Materials Package:</b> {formatCad(materialsKitFeeCents)}</p>
            </div>
          </article>
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--line)] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Materials And Tools</p>
          <p className="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">
            All materials listed below are required for the course, and students are expected to provide them when needed.
            For an additional optional fee of {formatCad(materialsKitFeeCents)}, OW Couture can provide the full materials package.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4">
              <p className="text-sm font-semibold text-neutral-950">Provided If You Select The Optional Package</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800">
                <li>Small sewing tools needed for class</li>
                <li>All fabrics and materials for weekly lessons</li>
                <li>Corsetry materials for the final project</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 md:col-span-2">
              <p className="text-sm font-semibold text-neutral-950">Refund Policy</p>
              <p className="mt-2 text-sm leading-7 text-neutral-700">
                If you decide to opt out of the course before it commences, only the optional materials package fee
                ({formatCad(materialsKitFeeCents)}) is refundable, if that payment was made.
              </p>
            </div>
          </div>
        </section>

        <section id="course-register" className="mt-6 rounded-[28px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Step 1: Register And Pay</p>
          <h2 className="mt-3 text-[clamp(30px,4vw,48px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
            Complete payment to unlock your assessment.
          </h2>

          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Important: after payment, you will return here automatically for the test. Do not exit before completing the assessment.
          </p>

          {paymentNotice ? (
            <p className={`mt-3 rounded-xl border px-4 py-3 text-sm ${isPaymentVerified ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-white text-neutral-700"}`}>
              {paymentNotice}
            </p>
          ) : null}

          {!isPaymentVerified ? (
            <form
              className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4"
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
                  disabled={isRecoveringAccess}
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

          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitState("idle");
              setSubmitMessage("");
              setIsSubmitting(true);

              const formData = new FormData(event.currentTarget);
              const payload = {
                fullName: String(formData.get("fullName") ?? "").trim(),
                email: String(formData.get("email") ?? "").trim(),
                phone: String(formData.get("phone") ?? "").trim(),
                experienceLevel: String(formData.get("experienceLevel") ?? "").trim(),
                interestReason: String(formData.get("interestReason") ?? "").trim(),
                preferredContactMethod: String(formData.get("preferredContactMethod") ?? "").trim(),
                wantsMaterialsKit,
              };

              const response = await fetch("/api/fashion-course/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const result = (await response.json()) as { message?: string; url?: string };

              if (!response.ok || !result.url) {
                setSubmitState("error");
                setSubmitMessage(result.message ?? "Unable to start payment right now.");
                setIsSubmitting(false);
                return;
              }

              setSubmitState("success");
              setSubmitMessage("Redirecting to secure payment...");
              window.location.assign(result.url);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Full Name
                <input
                  name="fullName"
                  required
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Phone Number
                <input
                  name="phone"
                  required
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                />
              </label>

              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Experience Level
                <select
                  name="experienceLevel"
                  required
                  defaultValue=""
                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
                >
                  <option value="" disabled>Select level</option>
                  <option value="No prior experience">No prior experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Why are you interested in this course?
              <textarea
                name="interestReason"
                required
                rows={4}
                className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              />
            </label>

            <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Preferred Contact Method
              <select
                name="preferredContactMethod"
                required
                defaultValue=""
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              >
                <option value="" disabled>Select contact method</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={wantsMaterialsKit}
                onChange={(event) => setWantsMaterialsKit(event.target.checked)}
                className="mt-1"
              />
              <span>
                I want the optional full materials package for {formatCad(materialsKitFeeCents)}. This will be added to my payment total.
              </span>
            </label>

            <p className="text-sm text-neutral-700">
              Amount due now: <b>{formatCad(totalPayableCents)}</b>
            </p>

            {submitState === "error" ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitMessage}</p>
            ) : null}

            {submitState === "success" ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{submitMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isVerifyingPayment}
              className="w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? "Redirecting..." : `Pay ${formatCad(totalPayableCents)} And Continue`}
            </button>
          </form>
        </section>

        <section id="assessment" className="mt-6 rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Step 2: Basic Skills Assessment</p>
          <h3 className="mt-3 text-[clamp(28px,3.6vw,44px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
            10-question multiple choice test
          </h3>

          {!isPaymentVerified ? (
            <p className="mt-4 rounded-xl border border-neutral-200 bg-[var(--soft)] px-4 py-3 text-sm text-neutral-700">
              Assessment is locked until payment is confirmed.
            </p>
          ) : null}

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

              const payload = (await response.json()) as { message?: string };

              if (!response.ok) {
                setAssessmentState("error");
                setAssessmentMessage(payload.message ?? "Unable to submit assessment right now.");
                setIsAssessmentSubmitting(false);
                return;
              }

              setAssessmentState("success");
              setAssessmentMessage(payload.message ?? "Assessment submitted successfully.");
              setIsAssessmentSubmitting(false);
            }}
          >
            <div className="grid gap-4">
              {assessmentQuestions.map((question, index) => (
                <fieldset key={question.key} className="rounded-2xl border border-[var(--line)] p-4" disabled={!isPaymentVerified || isAssessmentSubmitting}>
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

            {assessmentState === "success" ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{assessmentMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={!isPaymentVerified || isAssessmentSubmitting}
              className="w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isAssessmentSubmitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </form>
        </section>
      </section>

      {showScrollHint ? (
        <a
          href="#course-register"
          aria-label="Scroll down"
          className="fixed bottom-6 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/20 bg-white/95 px-4 py-2 text-xs uppercase tracking-[0.14em] text-neutral-800 shadow-[0_10px_26px_rgba(0,0,0,0.12)] backdrop-blur transition hover:-translate-y-0.5"
        >
          Scroll for details
          <span className="inline-block animate-bounce">↓</span>
        </a>
      ) : null}
    </main>
  );
}
