export type HomepageContent = {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  testimonialTitle: string;
  testimonialBody: string;
  contactTitle: string;
  contactBody: string;
};

export const defaultHomepageContent: HomepageContent = {
  heroTitle: "OW Couture.",
  heroSubtitle: "Made to order. Made for you.",
  aboutTitle: "Not fast fashion. Lasting fashion.",
  aboutBody:
    "OW Couture is a made-to-order fashion house creating refined bridal, ready-to-wear, bridesmaids, and evening pieces. Our process is personal, intentional, and tailored around the woman wearing the garment.",
  testimonialTitle: "Obsessed with your experience.",
  testimonialBody: "Timeless pieces. Your favourite outfit waiting to happen. Bringing dreams to reality.",
  contactTitle: "Contact",
  contactBody: "Email: hello@owcouture.com\nFallback: info@owcouture.com\nInstagram: @OWCouture",
};

export function normalizeHomepageContent(input: Partial<HomepageContent> | null | undefined): HomepageContent {
  return {
    heroTitle: input?.heroTitle?.trim() || defaultHomepageContent.heroTitle,
    heroSubtitle: input?.heroSubtitle?.trim() || defaultHomepageContent.heroSubtitle,
    aboutTitle: input?.aboutTitle?.trim() || defaultHomepageContent.aboutTitle,
    aboutBody: input?.aboutBody?.trim() || defaultHomepageContent.aboutBody,
    testimonialTitle: input?.testimonialTitle?.trim() || defaultHomepageContent.testimonialTitle,
    testimonialBody: input?.testimonialBody?.trim() || defaultHomepageContent.testimonialBody,
    contactTitle: input?.contactTitle?.trim() || defaultHomepageContent.contactTitle,
    contactBody: input?.contactBody?.trim() || defaultHomepageContent.contactBody,
  };
}
