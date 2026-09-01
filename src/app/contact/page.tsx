import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | OW Couture",
  description: "Send a message to OW Couture.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Contact</p>
          <h1 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Let us know what you are creating.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Share your idea, timeline, or request, and our studio team will follow up with next steps.
          </p>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}