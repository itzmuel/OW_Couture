import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CatalogCollectionConfig = {
  slug: "wedding" | "rtw" | "evening";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  sortOrder: number;
  archived: boolean;
};

type CatalogCollectionRow = {
  slug: CatalogCollectionConfig["slug"];
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  cta_eyebrow: string;
  cta_title: string;
  cta_body: string;
  sort_order: number;
  archived: boolean;
};

const fallbackCollections: CatalogCollectionConfig[] = [
  {
    slug: "wedding",
    label: "Wedding Dresses",
    eyebrow: "Wedding Dresses",
    title: "A gown with your name in the details.",
    description: "Choose Order, Bespoke Service, or Customize. Additional measurements will be taken during your consultation.",
    ctaEyebrow: "Book a Bridal Consultation",
    ctaTitle: "Start your bridal journey.",
    ctaBody: "A $50 non-refundable fee is required to secure your appointment.",
    sortOrder: 1,
    archived: false,
  },
  {
    slug: "rtw",
    label: "RTW Collection",
    eyebrow: "RTW Collection",
    title: "Ready-to-wear, made slowly.",
    description: "Pre-order refined silhouettes or customize measurements before checkout.",
    ctaEyebrow: "Book a Tailoring Consultation",
    ctaTitle: "Get the fit right.",
    ctaBody: "A $50 non-refundable fee is required to secure your appointment.",
    sortOrder: 2,
    archived: false,
  },
  {
    slug: "evening",
    label: "Bridesmaids & Evening",
    eyebrow: "Bridesmaids & Evening",
    title: "Elegant pieces for moments that last.",
    description: "Pre-order or customize selected occasionwear. Consultation is recommended for complex bridal-party orders.",
    ctaEyebrow: "Book a Consultation",
    ctaTitle: "Dress your whole party.",
    ctaBody: "A $50 non-refundable fee is required to secure your appointment.",
    sortOrder: 3,
    archived: false,
  },
];

function toCollectionConfig(row: CatalogCollectionRow): CatalogCollectionConfig {
  return {
    slug: row.slug,
    label: row.label,
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,
    ctaEyebrow: row.cta_eyebrow,
    ctaTitle: row.cta_title,
    ctaBody: row.cta_body,
    sortOrder: row.sort_order,
    archived: row.archived,
  };
}

export async function getCatalogCollections(): Promise<CatalogCollectionConfig[]> {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("catalog_collections")
      .select("slug,label,eyebrow,title,description,cta_eyebrow,cta_title,cta_body,sort_order,archived")
      .eq("archived", false)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackCollections;
    }

    return (data as CatalogCollectionRow[]).map(toCollectionConfig);
  } catch {
    return fallbackCollections;
  }
}

export async function getCatalogCollection(slug: CatalogCollectionConfig["slug"]) {
  const collections = await getCatalogCollections();
  return collections.find((collection) => collection.slug === slug) ?? fallbackCollections.find((collection) => collection.slug === slug)!;
}
