"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { defaultHomepageContent, type HomepageContent } from "@/lib/admin/website";

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
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(defaultHomepageContent);
  const [showBookmarkPrompt, setShowBookmarkPrompt] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const loadHomepageContent = async () => {
      const response = await fetch("/api/site-content", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as { homepage?: HomepageContent };
      if (!isMounted || !payload.homepage) {
        return;
      }

      setHomepageContent(payload.homepage);
    };

    void loadHomepageContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("ow-bookmark-prompt-dismissed");
    if (!dismissed) {
      setShowBookmarkPrompt(true);
    }
  }, []);

  return (
    <main>
      {showBookmarkPrompt ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-4 pt-20 sm:items-center">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Bookmark OW Couture</p>
            <h2 className="mt-3 text-[clamp(28px,4vw,42px)] leading-[1.02] tracking-[-0.045em] text-neutral-950">
              Save us so you can come back to your personalized shopping experience.
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-700">
              Bookmark this site now so you can easily return to your made-to-order pieces, gallery, and private consultation flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem("ow-bookmark-prompt-dismissed", "1");
                  setShowBookmarkPrompt(false);
                }}
                className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-900"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem("ow-bookmark-prompt-dismissed", "1");
                  setShowBookmarkPrompt(false);
                }}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:border-black"
              >
                Don’t show again
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
            <div className="mx-auto w-fit rounded-[28px] bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.26)] sm:px-6 sm:py-4">
              <BrandLogo className="h-28 w-auto sm:h-32" priority />
            </div>
            <h1 className="text-[clamp(44px,8vw,96px)] leading-[0.95] tracking-[-0.07em] text-white">{homepageContent.heroTitle}</h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">{homepageContent.heroSubtitle}</p>
            <Link href="#collections" className="mt-6 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:-translate-y-0.5">
              Explore Collections
            </Link>
          </div>
        </div>
      </header>

      <section id="collections" className="border-b border-[var(--line)] py-20">
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
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Gallery</p>
          <h2 className="text-[clamp(30px,4vw,52px)] font-black leading-[1.02] tracking-[-0.045em] text-neutral-950">
            Signature pieces, captured in detail.
          </h2>
          <div className="flex justify-end">
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
            <h2 className="mt-3 text-[40px] leading-[1] tracking-[-0.05em] text-neutral-950">&ldquo;{homepageContent.testimonialTitle}&rdquo;</h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
              {homepageContent.testimonialBody}
            </p>
          </div>
          <div data-scroll-reveal data-scroll-direction="right" className="rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Instagram</p>
            <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3">
              {instagramImages.map((image, index) => (
                <div key={image} data-scroll-reveal data-scroll-delay={80 + index * 55} className="overflow-hidden rounded-[20px]">
                  <img src={image} alt={`Instagram look ${index + 1}`} className="h-36 w-full object-cover transition duration-300 hover:scale-[1.03]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">About OW Couture</p>
          <h2 className="text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">{homepageContent.aboutTitle}</h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {homepageContent.aboutBody}
          </p>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div data-scroll-reveal data-scroll-direction="right" className="mx-auto w-full max-w-[620px] rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-7">
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
