import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { getProductBySlug, products } from "@/data/products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | OW Couture",
    };
  }

  return {
    title: `${product.name} | OW Couture`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white">
            <img src={product.image} alt={product.name} className="h-full min-h-[24rem] w-full object-cover" />
          </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{product.collection}</p>
            <h1 className="mt-4 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">{product.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Code: {product.code}</p>
            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">{product.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--soft)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">From</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">{product.priceFrom}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--soft)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Lead time</p>
              <p className="mt-2 text-2xl font-semibold text-neutral-950">{product.leadTime}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--soft)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Consultation</p>
              <p className="mt-2 text-lg font-semibold text-neutral-950">{product.appointmentType}</p>
            </div>
          </div>

          <p className="text-base leading-8 text-[var(--muted)]">{product.tagline}</p>

          <div className="flex flex-wrap gap-3">
            <Link href="/consultation" className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900">
              Book consultation
            </Link>
            <Link href="/catalog" className="rounded-full border border-black bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:-translate-y-0.5">
              Back to catalog
            </Link>
          </div>
        </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-16">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-[28px] border border-[var(--line)] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Materials</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-700">
            {product.materials.map((material) => (
              <li key={material}>{material}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[28px] border border-[var(--line)] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Made for</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-700">
            {product.madeFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[28px] border border-[var(--line)] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Highlights</p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-700">
            {product.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Related pieces</p>
            <h2 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Continue browsing the collection.</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
        </div>
      </section>
    </main>
  );
}