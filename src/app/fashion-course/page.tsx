"use client";

import { useEffect, useMemo, useState } from "react";

const courseDepositFeeCents = 99999;
const materialsKitFeeCents = 30000;

const learningOutcomes = [
  "Draft basic patterns from scratch.",
  "Understand and apply dart manipulation techniques.",
  "Construct a structured corset using professional methods.",
  "Complete one final project that demonstrates craftsmanship and creativity.",
];

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
  const [paymentNotice, setPaymentNotice] = useState("");
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [wantsMaterialsKit, setWantsMaterialsKit] = useState(false);

  const totalPayableCents = useMemo(() => {
    return wantsMaterialsKit ? courseDepositFeeCents + materialsKitFeeCents : courseDepositFeeCents;
  }, [wantsMaterialsKit]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentState = params.get("course_payment");

    if (paymentState === "cancelled") {
      setPaymentNotice("Payment was cancelled. Complete payment to continue to assessment.");
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
            Important: after payment, you will be redirected to the assessment page automatically.
          </p>

          {paymentNotice ? (
            <p className="mt-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">
              {paymentNotice}
            </p>
          ) : null}

          <p className="mt-4 text-sm text-neutral-700">
            Already paid and need to continue? Open the assessment page and use the recovery option there.
            {" "}
            <a href="/fashion-course/assessment" className="font-semibold underline underline-offset-2">
              Go to assessment
            </a>
            .
          </p>

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
              disabled={isSubmitting}
              className="w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? "Redirecting..." : `Pay ${formatCad(totalPayableCents)} And Continue`}
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
