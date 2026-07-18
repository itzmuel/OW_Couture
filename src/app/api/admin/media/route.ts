import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { hasAdminPermission } from "@/lib/admin/team";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

const mediaBucketName = "product-media";

type MediaAsset = {
  path: string;
  url: string;
  name: string;
  createdAt: string | null;
};

async function ensureMediaBucket() {
  const adminClient = createSupabaseAdminClient();
  const { data: buckets, error } = await adminClient.storage.listBuckets();

  if (error) {
    return { ok: false, message: error.message } as const;
  }

  const exists = (buckets ?? []).some((bucket) => bucket.name === mediaBucketName);
  if (exists) {
    return { ok: true, adminClient } as const;
  }

  const { error: createError } = await adminClient.storage.createBucket(mediaBucketName, {
    public: true,
  });

  if (createError) {
    return { ok: false, message: createError.message } as const;
  }

  return { ok: true, adminClient } as const;
}

function isImageMimeType(contentType: string) {
  return contentType.startsWith("image/");
}

export async function GET() {
  const adminCheck = await ensureAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  if (!hasAdminPermission(adminCheck.permissions, "products:view") && !hasAdminPermission(adminCheck.permissions, "website:view")) {
    return NextResponse.json({ message: "You do not have permission to view media assets." }, { status: 403 });
  }

  const bucketResult = await ensureMediaBucket();
  if (!bucketResult.ok) {
    return NextResponse.json({ message: bucketResult.message }, { status: 500 });
  }

  const { data, error } = await bucketResult.adminClient.storage.from(mediaBucketName).list("", {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const assets: MediaAsset[] = (data ?? [])
    .filter((item) => !item.id?.endsWith("/"))
    .map((item) => {
      const { data: urlData } = bucketResult.adminClient.storage.from(mediaBucketName).getPublicUrl(item.name);
      return {
        path: item.name,
        url: urlData.publicUrl,
        name: item.name,
        createdAt: item.created_at ?? null,
      };
    });

  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  if (!hasAdminPermission(adminCheck.permissions, "products:manage") && !hasAdminPermission(adminCheck.permissions, "website:manage")) {
    return NextResponse.json({ message: "You do not have permission to upload media assets." }, { status: 403 });
  }

  const bucketResult = await ensureMediaBucket();
  if (!bucketResult.ok) {
    return NextResponse.json({ message: bucketResult.message }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "A file is required." }, { status: 400 });
  }

  if (!isImageMimeType(file.type)) {
    return NextResponse.json({ message: "Only image files are allowed." }, { status: 400 });
  }

  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : ".jpg";
  const path = `${Date.now()}-${randomUUID()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await bucketResult.adminClient.storage.from(mediaBucketName).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ message: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = bucketResult.adminClient.storage.from(mediaBucketName).getPublicUrl(path);

  return NextResponse.json(
    {
      asset: {
        path,
        name: path,
        url: urlData.publicUrl,
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const adminCheck = await ensureAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  if (!hasAdminPermission(adminCheck.permissions, "website:manage")) {
    return NextResponse.json({ message: "You do not have permission to remove media assets." }, { status: 403 });
  }

  const payload = (await request.json()) as { path?: string };
  if (!payload.path) {
    return NextResponse.json({ message: "Media path is required." }, { status: 400 });
  }

  const bucketResult = await ensureMediaBucket();
  if (!bucketResult.ok) {
    return NextResponse.json({ message: bucketResult.message }, { status: 500 });
  }

  const { error } = await bucketResult.adminClient.storage.from(mediaBucketName).remove([payload.path]);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
