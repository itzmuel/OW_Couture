"use client";

import { useState } from "react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setIsSubmitted(false);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        message: String(formData.get("message") ?? ""),
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSubmitError(payload.message ?? "Unable to send message right now.");
      setIsSubmitting(false);
      return;
    }

    event.currentTarget.reset();
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <form onSubmit={submitForm} className="mt-10 grid gap-5 rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-8">
      <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        Name
        <input
          name="name"
          type="text"
          required
          placeholder="Your full name"
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </label>

      <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </label>

      <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        Phone Number (Optional)
        <input
          name="phone"
          type="tel"
          placeholder="(000) 000-0000"
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </label>

      <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        Message
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us what you would like to discuss."
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-full border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {submitError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      ) : null}

      {isSubmitted ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Message sent. We will get back to you soon.
        </p>
      ) : null}
    </form>
  );
}