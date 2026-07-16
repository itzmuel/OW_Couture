"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const galleryImages = [
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
];

const instagramImages = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
];

export default function Home() {
  const [heroOffset, setHeroOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateHeroOffset = () => {
      setHeroOffset(window.scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateHeroOffset);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main>
      <header
        id="home"
        className="relative min-h-[82vh] overflow-hidden text-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-[1.08] bg-[linear-gradient(rgba(0,0,0,0.18),rgba(0,0,0,0.34)),url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
          style={{ transform: `translate3d(0, ${Math.min(heroOffset * 0.28, 96)}px, 0) scale(1.08)` }}
        />
        <div className="mx-auto flex min-h-[82vh] w-full max-w-[1180px] items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="relative z-10 animate-[fadeIn_0.7s_ease_both]" style={{ transform: `translate3d(0, ${Math.min(heroOffset * 0.12, 36)}px, 0)` }}>
            <h1 className="text-[clamp(44px,8vw,96px)] leading-[0.95] tracking-[-0.07em] text-white">OW Couture.</h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">Made to order. Made for you.</p>
            <Link href="#collections" className="mt-6 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:-translate-y-0.5">
              Explore Collections
            </Link>
          </div>
        </div>
      </header>

      <section id="collections" className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Collections</p>
          <h2 className="max-w-4xl text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
            Couture, quiet luxury, and timeless form.
          </h2>
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
                  <h3 className="text-3xl tracking-[-0.04em] text-neutral-950">{card.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Lookbook</p>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Gallery of custom work.</h2>
            <Link
              href="/gallery"
              className="rounded-full border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              View more
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {galleryImages.map((image, index) => (
              <div
                key={image}
                data-scroll-reveal
                data-scroll-delay={120 + index * 90}
                className="overflow-hidden rounded-[24px]"
              >
                <img src={image} alt={`OW Couture gallery ${index + 1}`} className="h-[220px] w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-9 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div data-scroll-reveal data-scroll-direction="left" className="rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Testimonials</p>
            <h2 className="mt-3 text-[40px] leading-[1] tracking-[-0.05em] text-neutral-950">&ldquo;Obsessed with your experience.&rdquo;</h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
              Timeless pieces. Your favourite outfit waiting to happen. Bringing dreams to reality.
            </p>
          </div>
          <div data-scroll-reveal data-scroll-direction="right" className="rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Instagram</p>
            <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3">
              {instagramImages.map((image, index) => (
                <div key={image} data-scroll-reveal data-scroll-delay={80 + index * 55} className="overflow-hidden rounded-[20px]">
                  <img src={image} alt={`Instagram look ${index + 1}`} className="h-36 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">About OW Couture</p>
          <h2 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Not fast fashion. Lasting fashion.</h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            OW Couture is a made-to-order fashion house creating refined bridal, ready-to-wear, bridesmaids, and evening pieces. Our process is personal, intentional, and tailored around the woman wearing the garment.
          </p>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-9 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div data-scroll-reveal data-scroll-direction="left">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Digital Touchpoints</p>
            <h2 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Contact</h2>
            <p className="mt-4 text-base leading-8 text-neutral-800">
              Email: hello@owcouture.com
              <br />
              Fallback: info@owcouture.com
              <br />
              Instagram: @OWCouture
            </p>
          </div>
          <div data-scroll-reveal data-scroll-direction="right" className="rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-7">
            <h3 className="text-3xl tracking-[-0.04em] text-neutral-950">Order Tracking Portal</h3>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Email
                <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none" type="email" placeholder="name@example.com" />
              </label>
              <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                Order Number
                <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none" placeholder="OW-000123" />
              </label>
              <button className="w-fit rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white">Track Order</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
