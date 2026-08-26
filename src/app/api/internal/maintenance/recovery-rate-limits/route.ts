import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const defaultRetentionDays = 30;

function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || process.env.MAINTENANCE_CRON_SECRET?.trim() || "";
}

function isAuthorized(request: Request) {
  const configuredSecret = getCronSecret();
  if (!configuredSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  const expected = `Bearer ${configuredSecret}`;
  return authHeader === expected;
}

function parseRetentionDays(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("retentionDays");

  if (!raw) {
    return defaultRetentionDays;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 7 || parsed > 180) {
    return defaultRetentionDays;
  }

  return parsed;
}

async function cleanupRecoveryRateLimits(retentionDays: number) {
  const adminClient = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: oldRows, error: selectError } = await adminClient
    .from("fashion_course_recovery_rate_limits")
    .select("identifier")
    .lt("updated_at", cutoff)
    .limit(5000);

  if (selectError) {
    throw new Error(selectError.message);
  }

  const identifiers = (oldRows ?? []).map((row) => row.identifier);

  if (identifiers.length === 0) {
    return { deleted: 0 };
  }

  const { error: deleteError } = await adminClient
    .from("fashion_course_recovery_rate_limits")
    .delete()
    .in("identifier", identifiers);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return { deleted: identifiers.length };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const retentionDays = parseRetentionDays(request);
    const result = await cleanupRecoveryRateLimits(retentionDays);

    return NextResponse.json({
      ok: true,
      retentionDays,
      deletedRows: result.deleted,
      message: "Recovery rate-limit cleanup complete.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
