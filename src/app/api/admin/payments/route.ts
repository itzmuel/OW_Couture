import { NextResponse } from "next/server";

import type { AdminPaymentRow, AdminPaymentsPayload } from "@/lib/admin/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type OrderPaymentRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  payment_status: "pending" | "paid" | "refunded" | "cancelled";
  total_amount: number;
  currency: string;
  status: string;
};

export async function GET() {
  const adminCheck = await ensureAdminUser("payments:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("orders")
    .select("id,customer_name,customer_email,order_date,payment_status,total_amount,currency,status")
    .order("order_date", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const payments = ((data ?? []) as OrderPaymentRow[]).map<AdminPaymentRow>((row) => ({
    orderId: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    orderDate: row.order_date,
    paymentStatus: row.payment_status,
    amount: Number(row.total_amount ?? 0),
    currency: row.currency ?? "CAD",
    orderStatus: row.status,
  }));

  const payload: AdminPaymentsPayload = {
    summary: {
      paid: payments.filter((item) => item.paymentStatus === "paid").length,
      pending: payments.filter((item) => item.paymentStatus === "pending").length,
      refunded: payments.filter((item) => item.paymentStatus === "refunded").length,
      cancelled: payments.filter((item) => item.paymentStatus === "cancelled").length,
      totalRevenue: payments
        .filter((item) => item.paymentStatus === "paid")
        .reduce((sum, item) => sum + item.amount, 0),
    },
    payments,
  };

  return NextResponse.json(payload);
}
