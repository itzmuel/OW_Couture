import { NextResponse } from "next/server";

import type { AdminProduct } from "@/lib/admin/products";
import { hasAdminPermission } from "@/lib/admin/team";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type ProductRow = {
  slug: string;
  name: string;
  code: string;
  category: string;
  collection: string;
  tagline: string;
  description: string;
  price_from: string;
  lead_time: string;
  appointment_type: string;
  image: string;
  palette: string;
  materials: string[];
  made_for: string[];
  highlights: string[];
  featured: boolean;
  archived: boolean;
};

function toAdminProduct(row: ProductRow): AdminProduct {
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
    archived: row.archived,
  };
}

export async function GET() {
  const adminCheck = await ensureAdminUser("products:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.from("catalog_products").select("*").order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: ((data ?? []) as ProductRow[]).map(toAdminProduct) });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("products:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as Partial<AdminProduct> & { slug?: string };
  if (!payload.slug) {
    return NextResponse.json({ message: "Product slug is required." }, { status: 400 });
  }

  if (payload.archived !== undefined && !hasAdminPermission(adminCheck.permissions, "products:archive")) {
    return NextResponse.json({ message: "You do not have permission to archive products." }, { status: 403 });
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("catalog_products")
    .update({
      name: payload.name,
      code: payload.code,
      category: payload.category,
      collection: payload.collection,
      tagline: payload.tagline,
      description: payload.description,
      price_from: payload.priceFrom,
      lead_time: payload.leadTime,
      appointment_type: payload.appointmentType,
      image: payload.image,
      palette: payload.palette,
      materials: payload.materials,
      made_for: payload.madeFor,
      highlights: payload.highlights,
      featured: payload.featured,
      archived: payload.archived,
    })
    .eq("slug", payload.slug);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminUser("products:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as AdminProduct;
  if (!payload.slug || !payload.name || !payload.code) {
    return NextResponse.json({ message: "slug, name, and code are required." }, { status: 400 });
  }

  if (payload.archived && !hasAdminPermission(adminCheck.permissions, "products:archive")) {
    return NextResponse.json({ message: "You do not have permission to archive products." }, { status: 403 });
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("catalog_products").insert({
    slug: payload.slug,
    name: payload.name,
    code: payload.code,
    category: payload.category,
    collection: payload.collection,
    tagline: payload.tagline,
    description: payload.description,
    price_from: payload.priceFrom,
    lead_time: payload.leadTime,
    appointment_type: payload.appointmentType,
    image: payload.image,
    palette: payload.palette,
    materials: payload.materials,
    made_for: payload.madeFor,
    highlights: payload.highlights,
    featured: payload.featured,
    archived: payload.archived,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
