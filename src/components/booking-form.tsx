"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth-context";
import {
  addConsultationSubmission,
  type ConsultationSubmission,
  type ConsultationSubmissionInput,
} from "@/data/consultation-submissions";

type BookingSubmission = ConsultationSubmission;

function formatDate(dateValue: string) {
  if (!dateValue) {
    return "Not provided";
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeValue: string) {
  if (!timeValue) {
    return "Not provided";
  }

  const [hours, minutes] = timeValue.split(":");
  if (!hours || !minutes) {
    return timeValue;
  }

  const parsedDate = new Date();
  parsedDate.setHours(Number(hours), Number(minutes), 0, 0);

  return parsedDate.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BookingForm() {
  const [submission, setSubmission] = useState<BookingSubmission | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  if (submission) {
    return (
      <div className="rounded-[30px] border border-[var(--line)] bg-[#fafafa] p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Consultation booked</p>
        <h3 className="mt-3 text-3xl leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-4xl">Thank you, {submission.name}.</h3>
        <div className="mt-5 rounded-[24px] border border-[#d8d8d8] bg-white p-5 text-sm leading-7 text-neutral-700">
          <p><b>Step 1:</b> Consultation request received.</p>
          <p><b>Step 2:</b> Check {submission.email} for confirmation.</p>
          <p><b>Step 3:</b> Admin will review and finalize your slot shortly.</p>
        </div>
        <div className="mt-4 grid gap-2 rounded-[24px] border border-[var(--line)] bg-white p-5 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
          <p><b>Date:</b> {formatDate(submission.date)}</p>
          <p><b>Time:</b> {formatTime(submission.time)}</p>
          <p><b>Consultation:</b> {submission.consultationType}</p>
          <p><b>Phone:</b> {submission.phone}</p>
        </div>
        <p className="mt-4 text-sm leading-7 text-neutral-700">{submission.request}</p>
        <button
          type="button"
          onClick={() => setSubmission(null)}
          className="mt-6 w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 sm:w-auto"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6 rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-5 sm:p-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");

        const formData = new FormData(event.currentTarget);
        const createdSubmission = await addConsultationSubmission({
          userId: currentUser?.id ?? null,
          name: String(formData.get("name") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          date: String(formData.get("date") ?? ""),
          time: String(formData.get("time") ?? ""),
          consultationType: String(formData.get("type") ?? "Private studio fitting"),
          request: String(formData.get("request") ?? "").trim(),
        } satisfies ConsultationSubmissionInput);

        if (!createdSubmission.ok) {
          setSubmitError(createdSubmission.message);
          setIsSubmitting(false);
          return;
        }

        setSubmission(createdSubmission.submission);
        setIsSubmitting(false);
        event.currentTarget.reset();
      }}
    >
      <div className="grid gap-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Contact details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Name
            <input
              name="name"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              placeholder="Your full name"
            />
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              placeholder="name@example.com"
            />
          </label>
        </div>
        <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
          Phone
          <input
            name="phone"
            required
            pattern="^[0-9+()\-\s]{7,}$"
            title="Please enter a valid phone number."
            className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
            placeholder="Phone number"
          />
        </label>
      </div>

      <div className="grid gap-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Appointment preferences</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Preferred date
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
            />
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Preferred time
            <input
              type="time"
              name="time"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
            />
          </label>
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)] sm:col-span-2">
            Consultation type
            <select
              name="type"
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              defaultValue="Private studio fitting"
            >
              <option>Private studio fitting</option>
              <option>Virtual consultation</option>
              <option>Bridal consultation</option>
            </select>
          </label>
        </div>
      </div>

      <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        Tell us more
        <textarea
          name="request"
          required
          rows={5}
          className="rounded-[24px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
          placeholder="Wedding date, style preferences, fabric ideas, inspiration, or special requests"
        />
      </label>
      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      ) : null}
      <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--muted)]">$50 non-refundable fee required to lock your appointment.</p>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
          {isSubmitting ? "Submitting..." : "Pay $50 & Book"}
        </button>
      </div>
    </form>
  );
}
