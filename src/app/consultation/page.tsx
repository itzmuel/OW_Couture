import type { Metadata } from "next";

import { BookingForm } from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Consultation | OW Couture",
  description: "Request a private OW Couture consultation for eveningwear, bridal pieces, or custom tailoring.",
};

const consultationSteps = [
  "Share your event, timing, and preferred silhouette.",
  "Receive a follow-up within 24 hours with next-step guidance.",
  "Book a studio or virtual fitting and refine the piece together.",
];

export default function ConsultationPage() {
  return (
    <main className="py-20">
      <section className="mx-auto grid w-full max-w-[1180px] gap-9 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Book Consultation</p>
            <h1 className="mt-4 max-w-[10ch] text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
              Secure your appointment.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              <b>$50 non-refundable fee required to lock your appointment.</b>
            </p>
          </div>

          <div className="grid gap-4">
            {consultationSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[24px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--soft)] text-sm font-semibold text-neutral-950">
                  0{index + 1}
                </div>
                <p className="text-sm leading-7 text-neutral-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <BookingForm />
      </section>
    </main>
  );
}