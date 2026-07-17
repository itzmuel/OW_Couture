import { NextResponse } from "next/server";

import type { AdminCollection } from "@/lib/admin/collections";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type CollectionRow = {
  slug: AdminCollection["slug"];
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

function toAdminCollection(row: CollectionRow): AdminCollection {
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

export async function GET() {
  const adminCheck = await ensureAdminUser("collections:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.from("catalog_collections").select("*").order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ collections: ((data ?? []) as CollectionRow[]).map(toAdminCollection) });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("collections:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as AdminCollection;
  if (!payload.slug) {
    return NextResponse.json({ message: "Collection slug is required." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("catalog_collections")
    .update({
      label: payload.label,
      eyebrow: payload.eyebrow,
      title: payload.title,
      description: payload.description,
      cta_eyebrow: payload.ctaEyebrow,
      cta_title: payload.ctaTitle,
      cta_body: payload.ctaBody,
      sort_order: payload.sortOrder,
      archived: payload.archived,
    })
    .eq("slug", payload.slug);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
