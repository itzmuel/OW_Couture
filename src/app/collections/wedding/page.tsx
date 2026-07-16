import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getProductsByCollection } from "@/data/products";

export const metadata: Metadata = {
  title: "Wedding Dresses | OW Couture",
  description: "Made-to-order bridal gowns and wedding pieces from OW Couture.",
};

export default function WeddingCollectionPage() {
  const products = getProductsByCollection("Wedding Dresses");

  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <Link
            href="/#wedding"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-neutral-950"
          >
            ← Collections
          </Link>
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Wedding Dresses</p>
          <h1 className="max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
            A gown with your name in the details.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Choose Order, Bespoke Service, or Customize. Additional measurements will be taken during your consultation.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          <div className="mt-14 rounded-[28px] border border-[var(--line)] bg-[var(--soft)] p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Book a Bridal Consultation</p>
            <h2 className="mt-3 text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.045em] text-neutral-950">
              Start your bridal journey.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
              A $50 non-refundable fee is required to secure your appointment.
            </p>
            <Link
                href="/consultation"
              className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
