import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections | OW Couture",
  description: "Explore OW Couture bridal, RTW, and evening collections.",
};

const collectionCards = [
  {
    title: "Wedding",
    description: "Order, bespoke service, or customize.",
    href: "/collections/wedding",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "RTW",
    description: "Pre-order and customize selected pieces.",
    href: "/collections/rtw",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Evening",
    description: "Bridesmaids and occasionwear.",
    href: "/collections/evening",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  },
];

export default function CollectionPage() {
  return (
    <main>
      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-[26px] border border-black bg-black px-5 py-5 text-white sm:px-7 sm:py-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/75">Now Open</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-3xl text-base leading-7 sm:text-lg">
                Registration is open for the 8-week Fashion Design Course. Classes start in October 2026 and registration closes September 30, 2026.
              </p>
              <Link
                href="/fashion-course"
                className="inline-flex rounded-full border border-white bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:-translate-y-0.5"
              >
                Learn more
              </Link>
            </div>
          </div>
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Collections</p>
          <h1 className="max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
            Couture, quiet luxury, and timeless form.
          </h1>
          <div className="mt-8 grid gap-[18px] md:grid-cols-3">
            {collectionCards.map((card, index) => (
              <Link
                key={card.title}
                href={card.href}
                data-scroll-reveal
                data-scroll-delay={140 + index * 110}
                data-scroll-direction={index % 2 === 0 ? "left" : "right"}
                className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.09)]"
              >
                <img src={card.image} alt={card.title} className="h-80 w-full object-cover" />
                <div className="p-6">
                  <h2 className="text-3xl tracking-[-0.04em] text-neutral-950">{card.title}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}