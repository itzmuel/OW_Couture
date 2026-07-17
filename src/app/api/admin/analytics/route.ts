import { NextResponse } from "next/server";

import {
  formatAnalyticsCurrency,
  type AdminAnalyticsPayload,
} from "@/lib/admin/analytics";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

type OrderRow = {
  customer_email: string;
  order_date: string;
  total_amount: number;
  payment_status: string;
  status: string;
};

type ConsultationRow = {
  email: string;
  created_at: string;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-CA", { month: "short" });
}

export async function GET() {
  const adminCheck = await ensureAdminUser();
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const [{ data: ordersData, error: ordersError }, { data: consultationsData, error: consultationsError }] =
    await Promise.all([
      adminClient
        .from("orders")
        .select("customer_email,order_date,total_amount,payment_status,status")
        .order("order_date", { ascending: false }),
      adminClient
        .from("consultation_submissions")
        .select("email,created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (ordersError) {
    return NextResponse.json({ message: ordersError.message }, { status: 500 });
  }

  if (consultationsError) {
    return NextResponse.json({ message: consultationsError.message }, { status: 500 });
  }

  const orders = (ordersData ?? []) as OrderRow[];
  const consultations = (consultationsData ?? []) as ConsultationRow[];

  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const uniqueCustomers = new Set(orders.map((order) => order.customer_email.toLowerCase())).size;
  const returningCustomers = Array.from(
    orders.reduce((map, order) => {
      const email = order.customer_email.toLowerCase();
      map.set(email, (map.get(email) ?? 0) + 1);
      return map;
    }, new Map<string, number>()).values(),
  ).filter((count) => count > 1).length;
  const returningCustomerRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;
  const consultationToOrderRate = consultations.length > 0 ? (uniqueCustomers / consultations.length) * 100 : 0;

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return startOfMonth(date);
  });

  const revenueValues = months.map((monthStart) => {
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    return paidOrders
      .filter((order) => {
        const orderDate = new Date(order.order_date);
        return orderDate >= monthStart && orderDate < nextMonth;
      })
      .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  });

  const orderValues = months.map((monthStart) => {
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    return orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      return orderDate >= monthStart && orderDate < nextMonth;
    }).length;
  });

  const consultationValues = months.map((monthStart) => {
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    return consultations.filter((consultation) => {
      const createdAt = new Date(consultation.created_at);
      return createdAt >= monthStart && createdAt < nextMonth;
    }).length;
  });

  const fulfilledValues = months.map((monthStart) => {
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    return orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      return orderDate >= monthStart && orderDate < nextMonth && ["delivered", "ready-to-ship"].includes(order.status);
    }).length;
  });

  const payload: AdminAnalyticsPayload = {
    kpis: [
      { label: "Revenue", value: formatAnalyticsCurrency(totalRevenue), helper: "Paid orders only" },
      { label: "Average Order Value", value: formatAnalyticsCurrency(averageOrderValue), helper: "Based on paid orders" },
      { label: "Returning Customers", value: `${returningCustomerRate.toFixed(0)}%`, helper: `${returningCustomers} repeat clients` },
      { label: "Consultation Conversion", value: `${consultationToOrderRate.toFixed(0)}%`, helper: "Unique ordering clients vs consultations" },
    ],
    charts: [
      {
        title: "Revenue Trend",
        values: revenueValues,
        labels: months.map(monthLabel),
        format: "currency",
      },
      {
        title: "Orders per Month",
        values: orderValues,
        labels: months.map(monthLabel),
        format: "count",
      },
      {
        title: "Consultations per Month",
        values: consultationValues,
        labels: months.map(monthLabel),
        format: "count",
      },
      {
        title: "Fulfillment Output",
        values: fulfilledValues,
        labels: months.map(monthLabel),
        format: "count",
      },
    ],
    insights: [
      `There are ${uniqueCustomers} unique ordering clients in the current dataset.`,
      `Returning customer rate is ${returningCustomerRate.toFixed(0)}%, which is useful for identifying loyalty and referral momentum.`,
      "Traffic and conversion rate analytics will require website/session tracking instrumentation beyond order and consultation records.",
    ],
  };

  return NextResponse.json(payload);
}
