"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CartBubble } from "@/components/cart-bubble";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

const homeNav: NavItem[] = [
  { href: "/#home", label: "Home", match: (pathname) => pathname === "/" },
  { href: "/#collections", label: "Collections", match: () => false },
  { href: "/gallery", label: "Gallery", match: (pathname) => pathname.startsWith("/gallery") },
  { href: "/consultation", label: "Book Consultation", match: (pathname) => pathname === "/consultation" },
  { href: "/#about", label: "About Us", match: () => false },
  { href: "/#contact", label: "Contact", match: () => false },
];

const collectionNav: NavItem[] = [
  { href: "/", label: "Home", match: (pathname) => pathname === "/" },
  { href: "/collections/wedding", label: "Wedding Dresses", match: (pathname) => pathname === "/collections/wedding" },
  { href: "/collections/rtw", label: "RTW Collection", match: (pathname) => pathname === "/collections/rtw" },
  { href: "/collections/evening", label: "Bridesmaids & Evening", match: (pathname) => pathname === "/collections/evening" },
  { href: "/consultation", label: "Consultation", match: (pathname) => pathname === "/consultation" },
];

const catalogNav: NavItem[] = [
  { href: "/", label: "Home", match: (pathname) => pathname === "/" },
  { href: "/catalog", label: "Catalog", match: (pathname) => pathname.startsWith("/catalog") },
  { href: "/collections/wedding", label: "Wedding Dresses", match: (pathname) => pathname === "/collections/wedding" },
  { href: "/collections/rtw", label: "RTW Collection", match: (pathname) => pathname === "/collections/rtw" },
  { href: "/collections/evening", label: "Evening", match: (pathname) => pathname === "/collections/evening" },
  { href: "/consultation", label: "Consultation", match: (pathname) => pathname === "/consultation" },
];

const adminNav: NavItem[] = [
  { href: "/", label: "Home", match: (pathname) => pathname === "/" },
  { href: "/catalog", label: "Catalog", match: (pathname) => pathname.startsWith("/catalog") },
  { href: "/consultation", label: "Consultation", match: (pathname) => pathname === "/consultation" },
  { href: "/admin", label: "Admin", match: (pathname) => pathname.startsWith("/admin") },
];

function getNavigation(pathname: string): NavItem[] {
  if (pathname.startsWith("/collections/")) {
    return collectionNav;
  }

  if (pathname.startsWith("/catalog")) {
    return catalogNav;
  }

  if (pathname.startsWith("/admin")) {
    return adminNav;
  }

  return homeNav;
}

const searchablePages = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Wedding Collection", href: "/collections/wedding" },
  { label: "RTW Collection", href: "/collections/rtw" },
  { label: "Bridesmaids & Evening", href: "/collections/evening" },
  { label: "Catalog", href: "/catalog" },
  { label: "Consultation", href: "/consultation" },
  { label: "Admin", href: "/admin" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navigation = getNavigation(pathname);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return searchablePages;
    }

    return searchablePages.filter((page) => page.label.toLowerCase().includes(query));
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen && !isWishlistOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsWishlistOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isSearchOpen, isWishlistOpen]);

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main > header, main > section, main > div, main article, main [data-scroll-reveal]",
      ),
    );

    if (revealTargets.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      revealTargets.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    revealTargets.forEach((element, index) => {
      element.classList.add("scroll-reveal");

      const explicitDelay = Number(element.dataset.scrollDelay ?? "");
      const revealDelay = Number.isFinite(explicitDelay) ? explicitDelay : Math.min(index * 70, 280);
      const revealDirection = element.dataset.scrollDirection ?? "up";

      if (revealDirection === "left") {
        element.style.setProperty("--reveal-x", "-42px");
        element.style.setProperty("--reveal-y", "0px");
      } else if (revealDirection === "right") {
        element.style.setProperty("--reveal-x", "42px");
        element.style.setProperty("--reveal-y", "0px");
      } else if (revealDirection === "down") {
        element.style.setProperty("--reveal-x", "0px");
        element.style.setProperty("--reveal-y", "-28px");
      } else {
        element.style.setProperty("--reveal-x", "0px");
        element.style.setProperty("--reveal-y", "28px");
      }

      element.style.setProperty("--reveal-delay", `${revealDelay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            return;
          }

          entry.target.classList.remove("is-visible");
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealTargets.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 z-40">
        <div className="flex h-[34px] items-center justify-center bg-black px-4 text-center text-xs tracking-[0.03em] text-white">
          All our pieces are made exclusively on a pre-order basis. Production time varies by design. See individual product pages for estimates.
        </div>
        <header className="border-b border-black/8 bg-[rgba(255,255,255,0.85)] backdrop-blur-2xl">
          <div className="mx-auto flex h-[58px] w-full max-w-[1180px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-extrabold uppercase tracking-[0.08em] text-neutral-950">
              OW COUTURE
            </Link>
            <nav className="flex max-w-[58vw] items-center gap-2 overflow-x-auto whitespace-nowrap text-[13px] text-neutral-800 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navigation.map((item) => {
                const isActive = item.match(pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 transition-colors ${
                      isActive ? "bg-black text-white" : "text-neutral-700 hover:bg-black/5 hover:text-neutral-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3 text-sm text-neutral-900 sm:gap-4">
              <button
                type="button"
                aria-label="Search"
                title="Search"
                className="hidden rounded-full p-1 text-base leading-none transition hover:bg-black/5 sm:inline"
                onClick={() => {
                  setSearchQuery("");
                  setIsWishlistOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                &#8981;
              </button>
              <button
                type="button"
                aria-label="Wishlist"
                title="Wishlist"
                className="hidden rounded-full p-1 text-base leading-none transition hover:bg-black/5 sm:inline"
                onClick={() => {
                  setIsSearchOpen(false);
                  setIsWishlistOpen(true);
                }}
              >
                &#9825;
              </button>
              <span aria-label="Shopping bag" title="Shopping bag" className="relative inline-flex items-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 7h12l-1 13H7L6 7Z" />
                  <path d="M9 10V7a3 3 0 0 1 6 0v3" />
                </svg>
                <CartBubble className="absolute -right-2.5 -top-2 min-w-[18px] text-center" />
              </span>
            </div>
          </div>
        </header>
      </div>

      <div className="pt-[92px]">{children}</div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-4 pt-24 sm:pt-28">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Search</p>
              <button
                type="button"
                className="rounded-full bg-[var(--soft)] px-3 py-1 text-sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Close
              </button>
            </div>
            <input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search pages..."
              className="mt-4 w-full rounded-2xl border border-[var(--line)] px-4 py-3 text-sm outline-none transition-colors focus:border-black"
            />
            <div className="mt-4 grid gap-2">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <Link
                    key={result.href}
                    href={result.href}
                    className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm transition hover:bg-[var(--soft)]"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    {result.label}
                  </Link>
                ))
              ) : (
                <p className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)]">
                  No matching pages found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isWishlistOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close wishlist"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsWishlistOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-4xl leading-[0.95] tracking-[-0.04em] text-neutral-950">Wishlist</h3>
              <button
                type="button"
                className="rounded-full bg-[var(--soft)] px-3 py-1 text-sm"
                onClick={() => setIsWishlistOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Your saved pieces will appear here. For now, use the collection pages to explore and customize looks.
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/collections/wedding" onClick={() => setIsWishlistOpen(false)} className="rounded-full border border-black bg-black px-4 py-2.5 text-center text-sm text-white">
                Browse Wedding
              </Link>
              <Link href="/collections/rtw" onClick={() => setIsWishlistOpen(false)} className="rounded-full border border-black bg-white px-4 py-2.5 text-center text-sm text-black">
                Browse RTW
              </Link>
              <Link href="/collections/evening" onClick={() => setIsWishlistOpen(false)} className="rounded-full border border-black bg-white px-4 py-2.5 text-center text-sm text-black">
                Browse Evening
              </Link>
            </div>
          </aside>
        </div>
      )}

      <footer className="border-t border-[var(--line)] bg-[var(--soft)]">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">OW Couture</p>
            <h2 className="mt-4 max-w-lg text-4xl leading-[0.95] tracking-[-0.055em] text-neutral-950 sm:text-5xl">
              Made to order. Made for you.
            </h2>
          </div>
          <div className="grid gap-6 text-sm leading-7 text-neutral-700 sm:grid-cols-2">
            <div>
              <p className="font-medium text-neutral-950">Studio</p>
              <p className="mt-2">Refined bridal, ready-to-wear, bridesmaids, and evening pieces created through a personal made-to-order process.</p>
            </div>
            <div>
              <p className="font-medium text-neutral-950">Digital touchpoints</p>
              <p className="mt-2">hello@owcouture.com</p>
              <p>info@owcouture.com</p>
              <p>@OWCouture</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
