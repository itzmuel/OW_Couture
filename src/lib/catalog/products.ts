import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getFeaturedProducts as getStaticFeaturedProducts,
  getProductBySlug as getStaticProductBySlug,
  getProductsByCollection as getStaticProductsByCollection,
  products as staticProducts,
  type Product,
} from "@/data/products";

type CatalogProductRow = {
  slug: string;
  name: string;
  code: string;
  category: Product["category"];
  collection: Product["collection"];
  tagline: string;
  description: string;
  price_from: string;
  lead_time: string;
  appointment_type: string;
  image: string;
  palette: string;
  materials: string[] | null;
  made_for: string[] | null;
  highlights: string[] | null;
  featured: boolean;
  archived: boolean;
};

function toProduct(row: CatalogProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    code: row.code,
    category: row.category,
    collection: row.collection,
    tagline: row.tagline,
    description: row.description,
    priceFrom: row.price_from,
    leadTime: row.lead_time,
    appointmentType: row.appointment_type,
    image: row.image,
    palette: row.palette,
    materials: row.materials ?? [],
    madeFor: row.made_for ?? [],
    highlights: row.highlights ?? [],
    featured: row.featured,
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("catalog_products")
      .select(
        "slug,name,code,category,collection,tagline,description,price_from,lead_time,appointment_type,image,palette,materials,made_for,highlights,featured,archived",
      )
      .eq("archived", false)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return staticProducts;
    }

    return (data as CatalogProductRow[]).map(toProduct);
  } catch {
    return staticProducts;
  }
}

export async function getCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? getStaticProductBySlug(slug);
}

export async function getCatalogProductsByCollection(collection: Product["collection"]): Promise<Product[]> {
  const products = await getCatalogProducts();
  const filtered = products.filter((product) => product.collection === collection);
  return filtered.length > 0 ? filtered : getStaticProductsByCollection(collection);
}

export async function getCatalogFeaturedProducts(): Promise<Product[]> {
  const products = await getCatalogProducts();
  const featured = products.filter((product) => product.featured);
  return featured.length > 0 ? featured : getStaticFeaturedProducts();
}
