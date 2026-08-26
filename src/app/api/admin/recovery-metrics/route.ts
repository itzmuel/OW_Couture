import { NextResponse } from "next/server";

import { ensureAdminUser } from "@/lib/supabase/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const adminCheck = await ensureAdminUser("consultations:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();

  const [{ count, error: countError }, oldestResult, runResult] = await Promise.all([
    adminClient.from("fashion_course_recovery_rate_limits").select("identifier", { count: "exact", head: true }),
    adminClient
      .from("fashion_course_recovery_rate_limits")
      .select("updated_at")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    adminClient
      .from("fashion_course_recovery_maintenance_runs")
      .select("job_name,last_run_at,last_status,last_deleted_rows,last_retention_days,last_message")
      .eq("job_name", "recovery-rate-limits-cleanup")
      .maybeSingle(),
  ]);

  if (countError) {
    return NextResponse.json({ message: countError.message }, { status: 500 });
  }

  const oldestUpdatedAt = oldestResult.data?.updated_at ?? null;
  const maintenanceRun = runResult.data
    ? {
        lastRunAt: runResult.data.last_run_at,
        lastStatus: runResult.data.last_status,
        lastDeletedRows: runResult.data.last_deleted_rows,
        lastRetentionDays: runResult.data.last_retention_days,
        lastMessage: runResult.data.last_message,
      }
    : null;

  return NextResponse.json({
    recoveryLimiter: {
      rowCount: count ?? 0,
      oldestUpdatedAt,
    },
    maintenanceRun,
  });
}
