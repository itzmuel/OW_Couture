import { NextResponse } from "next/server";

import {
  formatMoney,
  type AdminDashboardPayload,
  type DashboardConsultationRow,
  type DashboardOrderRow,
} from "@/lib/admin/dashboard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(value: Date) {
  const next = startOfDay(value);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function formatWeekLabel(value: Date) {
  return value.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
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
        .select("id,customer_email,order_date,status,payment_status,production_stage,total_amount,created_at")
        .order("created_at", { ascending: false }),
      adminClient
        .from("consultation_submissions")
        .select("id,email,requested_date,status,created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (ordersError) {
    return NextResponse.json({ message: ordersError.message }, { status: 500 });
  }

  if (consultationsError) {
    return NextResponse.json({ message: consultationsError.message }, { status: 500 });
  }

  const orders = (ordersData ?? []) as DashboardOrderRow[];
  const consultations = (consultationsData ?? []) as DashboardConsultationRow[];

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todaysRevenue = orders
    .filter((order) => {
      const orderDate = new Date(order.order_date);
      return order.payment_status === "paid" && orderDate >= todayStart && orderDate <= todayEnd;
    })
    .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);

  const ordersAwaitingReview = orders.filter((order) => order.status === "awaiting-review").length;
  const consultationsToday = consultations.filter((consultation) => {
    const targetDate = consultation.requested_date ? new Date(consultation.requested_date) : new Date(consultation.created_at);
    return targetDate >= todayStart && targetDate <= todayEnd;
  }).length;
  const ordersInProduction = orders.filter((order) => order.status === "in-production").length;
  const readyForPickup = orders.filter((order) => order.status === "ready-to-ship").length;
  const pendingPayments = orders.filter((order) => order.payment_status === "pending").length;
  const recentRequests = consultations.filter((consultation) => {
    const createdAt = new Date(consultation.created_at);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt >= sevenDaysAgo;
  }).length;

  const weekStarts = Array.from({ length: 8 }, (_, index) => {
    const week = startOfWeek(now);
    week.setDate(week.getDate() - (7 - index) * 7);
    return week;
  });

  const revenueSeries = weekStarts.map((weekStart) => {
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    return orders
      .filter((order) => {
        const orderDate = new Date(order.order_date);
        return order.payment_status === "paid" && orderDate >= weekStart && orderDate <= weekEnd;
      })
      .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  });

  const monthlyOrdersSeries = weekStarts.map((weekStart) => {
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    return orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      return orderDate >= weekStart && orderDate <= weekEnd;
    }).length;
  });

  const consultationsSeries = weekStarts.map((weekStart) => {
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    return consultations.filter((consultation) => {
      const createdAt = new Date(consultation.created_at);
      return createdAt >= weekStart && createdAt <= weekEnd;
    }).length;
  });

  const productionSeries = weekStarts.map((weekStart) => {
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    return orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      return (
        createdAt >= weekStart &&
        createdAt <= weekEnd &&
        ["approved", "in-production", "ready-for-fitting", "ready-to-ship"].includes(order.status)
      );
    }).length;
  });

  const returningCustomersSeries = weekStarts.map((weekStart) => {
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    const emailCounts = new Map<string, number>();

    orders.forEach((order) => {
      const orderDate = new Date(order.order_date);
      if (orderDate >= weekStart && orderDate <= weekEnd) {
        emailCounts.set(order.customer_email, (emailCounts.get(order.customer_email) ?? 0) + 1);
      }
    });

    return Array.from(emailCounts.values()).filter((count) => count > 1).length;
  });

  const payload: AdminDashboardPayload = {
    greetingName: "Olivia",
    summaryCards: [
      { label: "Today's Revenue", value: formatMoney(todaysRevenue) },
      { label: "Orders Awaiting Review", value: String(ordersAwaitingReview) },
      { label: "Consultations Today", value: String(consultationsToday) },
      { label: "Orders In Production", value: String(ordersInProduction) },
      { label: "Ready for Pickup", value: String(readyForPickup) },
      { label: "Pending Payments", value: String(pendingPayments) },
      { label: "Recent Requests", value: String(recentRequests), tone: "muted" },
    ],
    chartTiles: [
      { title: "Revenue", values: revenueSeries, subtitle: `Weeks of ${formatWeekLabel(weekStarts[0])} to ${formatWeekLabel(weekStarts[7])}` },
      { title: "Monthly Orders", values: monthlyOrdersSeries, subtitle: "Weekly order intake" },
      { title: "Consultations", values: consultationsSeries, subtitle: "Weekly consultation demand" },
      { title: "Orders In Production", values: productionSeries, subtitle: "Weekly production load" },
      { title: "Returning Customers", values: returningCustomersSeries, subtitle: "Customers with repeat weekly orders" },
    ],
    notes: [
      "Top-selling dresses will become available once order line items are stored separately from orders.",
      "Recent Requests currently reflects consultation activity in the last 7 days.",
    ],
  };

  return NextResponse.json(payload);
}
