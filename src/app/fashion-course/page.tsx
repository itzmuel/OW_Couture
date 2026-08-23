"use client";

import { useState } from "react";

const learningOutcomes = [
  "Pattern drafting for the perfect fit",
  "Sewing a basic garment from start to finish",
  "Essential sewing techniques",
  "Garment styles and finishing methods",
  "Understanding measurements, fit, and construction",
];

const weeklyCurriculum = [
  "Week 1 - Measurements and foundations",
  "Week 2 - Introduction to pattern drafting",
  "Week 3 - Drafting for fit",
  "Week 4 - Fabric selection and cutting",
  "Week 5 - Garment construction",
  "Week 6 - Sewing techniques",
  "Week 7 - Styling and finishing",
  "Week 8 - Final garment project",
];

export default function FashionCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">OW Fashion Academy</p>
        <h1 className="mt-3 max-w-5xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
          8-Week Fashion Design Course
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)] sm:text-lg">
          Training designers on how to make clothing for real people. No prior experience needed.
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
              <p><b>Tuition:</b> Shared on acceptance</p>
            </div>
          </article>
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--line)] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Curriculum</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {weeklyCurriculum.map((week) => (
              <div key={week} className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-800">
                {week}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Register For The October Cohort</p>
          <h2 className="mt-3 text-[clamp(30px,4vw,48px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
            Secure your place in the course.
          </h2>

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
              };

              const response = await fetch("/api/fashion-course/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const result = (await response.json()) as { message?: string };

              if (!response.ok) {
                setSubmitState("error");
                setSubmitMessage(result.message ?? "Unable to submit your registration right now.");
                setIsSubmitting(false);
                return;
              }

              setSubmitState("success");
              setSubmitMessage(result.message ?? "Registration received. We will contact you shortly.");
              event.currentTarget.reset();
              setIsSubmitting(false);
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
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
