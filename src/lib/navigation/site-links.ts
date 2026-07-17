export type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

export type SearchPageLink = {
  label: string;
  href: string;
};

export type WishlistLink = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type FooterContent = {
  brandLabel: string;
  heading: string;
  studioTitle: string;
  studioDescription: string;
  digitalTitle: string;
  digitalTouchpoints: string[];
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

const accountNav: NavItem[] = [
  { href: "/", label: "Home", match: (pathname) => pathname === "/" },
  { href: "/catalog", label: "Catalog", match: (pathname) => pathname.startsWith("/catalog") },
  { href: "/consultation", label: "Consultation", match: (pathname) => pathname === "/consultation" },
  { href: "/account", label: "Account", match: (pathname) => pathname.startsWith("/account") },
];

export function getNavigation(pathname: string): NavItem[] {
  if (pathname.startsWith("/collections/")) {
    return collectionNav;
  }

  if (pathname.startsWith("/catalog")) {
    return catalogNav;
  }

  if (pathname.startsWith("/admin")) {
    return adminNav;
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/auth/")) {
    return accountNav;
  }

  return homeNav;
}

export const searchablePages: SearchPageLink[] = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Wedding Collection", href: "/collections/wedding" },
  { label: "RTW Collection", href: "/collections/rtw" },
  { label: "Bridesmaids & Evening", href: "/collections/evening" },
  { label: "Catalog", href: "/catalog" },
  { label: "Consultation", href: "/consultation" },
  { label: "Admin", href: "/admin" },
  { label: "Account", href: "/account" },
  { label: "Log in", href: "/auth/login" },
  { label: "Sign up", href: "/auth/signup" },
];

export const wishlistLinks: WishlistLink[] = [
  { label: "Browse Wedding", href: "/collections/wedding", variant: "primary" },
  { label: "Browse RTW", href: "/collections/rtw", variant: "secondary" },
  { label: "Browse Evening", href: "/collections/evening", variant: "secondary" },
];

export const footerContent: FooterContent = {
  brandLabel: "OW Couture",
  heading: "Made to order. Made for you.",
  studioTitle: "Studio",
  studioDescription:
    "Refined bridal, ready-to-wear, bridesmaids, and evening pieces created through a personal made-to-order process.",
  digitalTitle: "Digital touchpoints",
  digitalTouchpoints: ["hello@owcouture.com", "info@owcouture.com", "@OWCouture"],
};
