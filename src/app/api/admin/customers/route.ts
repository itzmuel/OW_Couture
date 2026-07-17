import { NextResponse } from "next/server";

import type { AdminCustomer } from "@/lib/admin/customers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type OrderRow = {
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_date: string;
  notes: string | null;
  measurements: Record<string, string | number | null> | null;
  created_at: string;
};

type ConsultationRow = {
  name: string;
  email: string;
  request: string;
  created_at: string;
};

export async function GET() {
  const adminCheck = await ensureAdminUser("customers:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const [{ data: ordersData, error: ordersError }, { data: consultationsData, error: consultationsError }] =
    await Promise.all([
      adminClient
        .from("orders")
        .select("customer_name,customer_email,total_amount,order_date,notes,measurements,created_at")
        .order("order_date", { ascending: false }),
      adminClient
        .from("consultation_submissions")
        .select("name,email,request,created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (ordersError) {
    return NextResponse.json({ message: ordersError.message }, { status: 500 });
  }

  if (consultationsError) {
    return NextResponse.json({ message: consultationsError.message }, { status: 500 });
  }

  const customers = new Map<string, AdminCustomer>();

  ((ordersData ?? []) as OrderRow[]).forEach((order) => {
    const email = order.customer_email.toLowerCase();
    const existing = customers.get(email) ?? {
      email,
      name: order.customer_name,
      orderCount: 0,
      consultationCount: 0,
      lifetimeSpend: 0,
      lastVisit: null,
      latestMeasurements: {},
      latestNotes: [],
      vip: false,
    };

    existing.name = existing.name || order.customer_name;
    existing.orderCount += 1;
    existing.lifetimeSpend += Number(order.total_amount ?? 0);
    existing.lastVisit = !existing.lastVisit || order.order_date > existing.lastVisit ? order.order_date : existing.lastVisit;
    if (Object.keys(existing.latestMeasurements).length === 0 && order.measurements) {
      existing.latestMeasurements = order.measurements;
    }
    if (order.notes && !existing.latestNotes.includes(order.notes)) {
      existing.latestNotes = [order.notes, ...existing.latestNotes].slice(0, 3);
    }
    customers.set(email, existing);
  });

  ((consultationsData ?? []) as ConsultationRow[]).forEach((consultation) => {
    const email = consultation.email.toLowerCase();
    const existing = customers.get(email) ?? {
      email,
      name: consultation.name,
      orderCount: 0,
      consultationCount: 0,
      lifetimeSpend: 0,
      lastVisit: null,
      latestMeasurements: {},
      latestNotes: [],
      vip: false,
    };

    existing.name = existing.name || consultation.name;
    existing.consultationCount += 1;
    existing.lastVisit = !existing.lastVisit || consultation.created_at.slice(0, 10) > existing.lastVisit
      ? consultation.created_at.slice(0, 10)
      : existing.lastVisit;
    if (consultation.request && !existing.latestNotes.includes(consultation.request)) {
      existing.latestNotes = [consultation.request, ...existing.latestNotes].slice(0, 3);
    }
    customers.set(email, existing);
  });

  const result = Array.from(customers.values())
    .map((customer) => ({
      ...customer,
      vip: customer.lifetimeSpend >= 3000 || customer.orderCount >= 2,
    }))
    .sort((left, right) => right.lifetimeSpend - left.lifetimeSpend || right.orderCount - left.orderCount);

  return NextResponse.json({ customers: result });
}
