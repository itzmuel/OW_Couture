"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { defaultHomepageContent, type HomepageContent } from "@/lib/admin/website";

const galleryImages = [
  "/IMG_2581.jpg",
  "/IMG_1662.jpg",
  "/IMG_2704.jpg",
  "/IMG_2583.PNG",
];

const socialProfiles = [
  {
    platform: "Instagram",
    handle: "@OWCouture",
    href: "https://www.instagram.com/owcouture/",
    icon: "instagram" as const,
  },
  {
    platform: "TikTok",
    handle: "@OWCouture",
    href: "https://www.tiktok.com/@owcouture",
    icon: "tiktok" as const,
  },
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
              Save OW Couture for your next fitting, custom order, and collection drop.
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-700">
              Keep us one tap away for made-to-order pieces, private consultations, and studio updates.
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
          className="absolute inset-0 scale-[1.08] bg-[linear-gradient(rgba(0,0,0,0.18),rgba(0,0,0,0.34)),url('/IMG_7293.jpg')] bg-cover bg-center"
          style={{ transform: `translate3d(0, ${Math.min(heroOffset * 0.28, 96)}px, 0) scale(1.08)` }}
        />
        <div className="mx-auto flex min-h-[82vh] w-full max-w-[1180px] items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="relative z-10 animate-[fadeIn_0.7s_ease_both]" style={{ transform: `translate3d(0, ${Math.min(heroOffset * 0.12, 36)}px, 0)` }}>
            <div className="mx-auto w-fit rounded-[28px] bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.26)] sm:px-6 sm:py-4">
              <BrandLogo className="h-28 w-auto sm:h-32" priority />
            </div>
            <h1 className="text-[clamp(44px,8vw,96px)] leading-[0.95] tracking-[-0.07em] text-white">{homepageContent.heroTitle}</h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">{homepageContent.heroSubtitle}</p>
            <Link href="/collection" className="mt-6 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:-translate-y-0.5">
              Explore Collections
            </Link>
          </div>
        </div>
      </header>

      <section id="gallery" className="border-b border-[var(--line)] py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Gallery</p>
          <h2 className="text-[clamp(30px,4vw,52px)] font-black leading-[1.02] tracking-[-0.045em] text-neutral-950">
            A closer look at cut, drape, and finish.
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
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Socials</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {socialProfiles.map((profile, index) => (
                <a
                  key={profile.platform}
                  href={profile.href}
                  target="_blank"
                  rel="noreferrer"
                  data-scroll-reveal
                  data-scroll-delay={80 + index * 90}
                  className="group flex items-center gap-4 rounded-[20px] border border-[var(--line)] bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-black"
                  aria-label={`Open OW Couture on ${profile.platform}`}
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-[var(--soft)] text-black transition group-hover:border-black">
                    {profile.icon === "instagram" ? (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    ) : (
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M15.6 3.2c1 .9 2.2 1.5 3.6 1.7v3.1a8.9 8.9 0 0 1-3.6-.8v6.2a5.4 5.4 0 1 1-4.5-5.3v3.2a2.3 2.3 0 1 0 1.4 2.1V2h3.1z" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold uppercase tracking-[0.1em] text-neutral-900">{profile.platform}</span>
                    <span className="block text-sm text-[var(--muted)]">{profile.handle}</span>
                  </span>
                </a>
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
