import { NextResponse } from "next/server";

import type { AdminMeasurementProfile } from "@/lib/admin/measurements";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type OrderMeasurementRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  measurements: Record<string, string | number | null> | null;
};

export async function GET() {
  const adminCheck = await ensureAdminUser("measurements:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("orders")
    .select("id,customer_name,customer_email,order_date,measurements")
    .order("order_date", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const profiles = new Map<string, AdminMeasurementProfile>();

  ((data ?? []) as OrderMeasurementRow[]).forEach((order) => {
    const measurements = order.measurements ?? {};
    if (Object.keys(measurements).length === 0) {
      return;
    }

    const email = order.customer_email.toLowerCase();
    const existing = profiles.get(email) ?? {
      email,
      customerName: order.customer_name,
      latestOrderId: order.id,
      latestOrderDate: order.order_date,
      latestMeasurements: measurements,
      history: [],
    };

    existing.history.push({
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: email,
      orderDate: order.order_date,
      measurements,
    });

    if (order.order_date >= existing.latestOrderDate) {
      existing.customerName = order.customer_name;
      existing.latestOrderId = order.id;
      existing.latestOrderDate = order.order_date;
      existing.latestMeasurements = measurements;
    }

    profiles.set(email, existing);
  });

  const result = Array.from(profiles.values())
    .map((profile) => ({
      ...profile,
      history: profile.history.sort((left, right) => right.orderDate.localeCompare(left.orderDate)),
    }))
    .sort((left, right) => right.latestOrderDate.localeCompare(left.latestOrderDate));

  return NextResponse.json({ profiles: result });
}
