import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getCatalogCollection } from "@/lib/catalog/collections";
import { getCatalogProductsByCollection } from "@/lib/catalog/products";

export const metadata: Metadata = {
  title: "RTW Collection | OW Couture",
  description: "Ready-to-wear made-to-order pieces from OW Couture.",
};

export default async function RTWCollectionPage() {
  const collection = await getCatalogCollection("rtw");
  const products = await getCatalogProductsByCollection("RTW Collection");

  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <Link
            href="/#collections"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-neutral-950"
          >
            ← Collections
          </Link>
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{collection.eyebrow}</p>
          <h1 className="max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">{collection.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">{collection.description}</p>
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
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{collection.ctaEyebrow}</p>
            <h2 className="mt-3 text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.045em] text-neutral-950">
              {collection.ctaTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">{collection.ctaBody}</p>
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
