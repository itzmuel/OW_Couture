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

export type ShippingPlanRow = {
  country: string;
  province: string;
  region: string;
  twoKg: string;
  additionalOneKg: string;
  timeline: string;
};

export type ShippingPlanContent = {
  rows: ShippingPlanRow[];
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
  contactBody: "Email: hello@owcouture.ca\nInstagram: @OWCouture",
};

export const defaultShippingPlanContent: ShippingPlanContent = {
  rows: [
    { country: "USA", province: "", region: "", twoKg: "59", additionalOneKg: "5.25", timeline: "4-6 days" },
    { country: "Canada", province: "Alberta", region: "", twoKg: "35", additionalOneKg: "2.61", timeline: "up to 7 days" },
    { country: "Canada", province: "British Columbia", region: "", twoKg: "31", additionalOneKg: "1.93", timeline: "up to 7 days" },
    { country: "Canada", province: "Manitoba", region: "", twoKg: "30", additionalOneKg: "1.43", timeline: "up to 5 days" },
    { country: "Canada", province: "New Brunswick", region: "", twoKg: "33", additionalOneKg: "1.71", timeline: "up to 5 days" },
    { country: "Canada", province: "Newfoundland and Labrador", region: "", twoKg: "34", additionalOneKg: "3.25", timeline: "up to 7 days" },
    { country: "Canada", province: "Nova Scotia", region: "", twoKg: "30", additionalOneKg: "1.79", timeline: "up to 5 days" },
    { country: "Canada", province: "Prince Edward Island", region: "", twoKg: "34", additionalOneKg: "2.11", timeline: "up to 5 days" },
    { country: "Canada", province: "Quebec", region: "", twoKg: "22", additionalOneKg: "1.75", timeline: "up to 3 days" },
    { country: "Canada", province: "Saskatchewan", region: "", twoKg: "28", additionalOneKg: "1.5", timeline: "up to 5 days" },
    { country: "Canada", province: "Ontario", region: "GTA", twoKg: "21", additionalOneKg: "1.04", timeline: "up to 2 days" },
    { country: "Canada", province: "Ontario", region: "Northern Ontario", twoKg: "27", additionalOneKg: "1.08", timeline: "up to 2 days" },
    { country: "Canada", province: "Ontario", region: "Southern Ontario", twoKg: "25", additionalOneKg: "1.15", timeline: "up to 2 days" },
  ],
};

function normalizeShippingPlanRow(input: Partial<ShippingPlanRow> | null | undefined): ShippingPlanRow {
  return {
    country: input?.country?.trim() || "",
    province: input?.province?.trim() || "",
    region: input?.region?.trim() || "",
    twoKg: input?.twoKg?.trim() || "",
    additionalOneKg: input?.additionalOneKg?.trim() || "",
    timeline: input?.timeline?.trim() || "",
  };
}

export function normalizeShippingPlanContent(input: Partial<ShippingPlanContent> | null | undefined): ShippingPlanContent {
  const rows = Array.isArray(input?.rows) ? input.rows : defaultShippingPlanContent.rows;

  return {
    rows: rows.map((row) => normalizeShippingPlanRow(row)),
  };
}

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
