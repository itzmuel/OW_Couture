import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { getProductsByCollection, products } from "@/data/products";

export const metadata: Metadata = {
  title: "Catalog | OW Couture",
  description: "Browse made-to-order eveningwear, bridal pieces, and tailored looks from OW Couture.",
};

export default function CatalogPage() {
  const sections = [
    {
      id: "wedding",
      eyebrow: "Wedding Dresses",
      title: "A gown with your name in the details.",
      description: "Choose Order, Bespoke Service, or Customize. Additional measurements will be taken during your consultation.",
      products: getProductsByCollection("Wedding Dresses"),
    },
    {
      id: "rtw",
      eyebrow: "RTW Collection",
      title: "Ready-to-wear, made slowly.",
      description: "Pre-order refined silhouettes or customize measurements before checkout.",
      products: getProductsByCollection("RTW Collection"),
    },
    {
      id: "evening",
      eyebrow: "Bridesmaids & Evening",
      title: "Elegant pieces for moments that last.",
      description: "Pre-order or customize selected occasionwear. Consultation is recommended for complex bridal-party orders.",
      products: getProductsByCollection("Bridesmaids & Evening"),
    },
  ];

  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Catalog</p>
          <div>
            <h1 className="max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
              Explore made-to-order bridal, RTW, and occasion collections.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Phase 1 now reads much closer to your reference: product-led sections, image cards, and consultation-first calls to action.
            </p>
          </div>
          <div className="mt-8 inline-flex rounded-full border border-[var(--line)] bg-[var(--soft)] px-4 py-2 text-sm text-neutral-800">
            Current catalog size: {products.length} pieces.
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="border-b border-[var(--line)] py-20 last:border-b-0">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{section.eyebrow}</p>
            <h2 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">{section.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">{section.description}</p>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {section.products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}