import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isOrderStatus,
  isPaymentStatus,
  isProductionStage,
  productionStageOrder,
  type AdminOrder,
} from "@/lib/admin/orders";

type OrderRow = {
  id: string;
  customer_user_id: string | null;
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: string;
  payment_status: string;
  production_stage: string;
  total_amount: number;
  currency: string;
  notes: string | null;
  measurements: Record<string, string | number | null> | null;
  inspiration_urls: string[] | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  order_id: string;
  stage: string;
  completed: boolean;
  completed_at: string | null;
};

type ItemRow = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

function toAdminOrder(row: OrderRow, events: EventRow[], items: ItemRow[]): AdminOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    orderDate: row.order_date,
    status: isOrderStatus(row.status) ? row.status : "awaiting-review",
    paymentStatus: isPaymentStatus(row.payment_status) ? row.payment_status : "pending",
    productionStage: isProductionStage(row.production_stage) ? row.production_stage : "payment-received",
    totalAmount: Number(row.total_amount ?? 0),
    currency: row.currency ?? "CAD",
    notes: row.notes,
    measurements: row.measurements ?? {},
    inspirationUrls: row.inspiration_urls ?? [],
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events: productionStageOrder.map((stage) => {
      const matching = events.find((item) => item.stage === stage);
      return {
        stage,
        completed: matching?.completed ?? false,
        completedAt: matching?.completed_at ?? null,
      };
    }),
    items: items.map((item) => ({
      id: item.id,
      productSlug: item.product_slug,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price ?? 0),
    })),
  };
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { ok: false as const, status: 401, message: "Authentication required." };
  }

  return { ok: true as const, user };
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const adminClient = createSupabaseAdminClient();
  const email = (auth.user.email ?? "").toLowerCase();

  const { data, error } = await adminClient
    .from("orders")
    .select(
      "id,customer_user_id,customer_name,customer_email,order_date,status,payment_status,production_stage,total_amount,currency,notes,measurements,inspiration_urls,shipping_address,created_at,updated_at",
    )
    .or(`customer_user_id.eq.${auth.user.id},customer_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as OrderRow[];
  if (rows.length === 0) {
    return NextResponse.json({ orders: [] as AdminOrder[] });
  }

  const orderIds = rows.map((row) => row.id);
  const [eventsResult, itemsResult] = await Promise.all([
    adminClient
      .from("order_production_events")
      .select("order_id,stage,completed,completed_at")
      .in("order_id", orderIds),
    adminClient
      .from("order_items")
      .select("id,order_id,product_slug,product_name,quantity,unit_price")
      .in("order_id", orderIds),
  ]);

  if (eventsResult.error) {
    return NextResponse.json({ message: eventsResult.error.message }, { status: 500 });
  }

  if (itemsResult.error) {
    return NextResponse.json({ message: itemsResult.error.message }, { status: 500 });
  }

  const eventsByOrder = new Map<string, EventRow[]>();
  (eventsResult.data ?? []).forEach((eventRow) => {
    const typedRow = eventRow as EventRow;
    const existing = eventsByOrder.get(typedRow.order_id) ?? [];
    existing.push(typedRow);
    eventsByOrder.set(typedRow.order_id, existing);
  });

  const itemsByOrder = new Map<string, ItemRow[]>();
  (itemsResult.data ?? []).forEach((itemRow) => {
    const typedRow = itemRow as ItemRow;
    const existing = itemsByOrder.get(typedRow.order_id) ?? [];
    existing.push(typedRow);
    itemsByOrder.set(typedRow.order_id, existing);
  });

  const orders = rows.map((row) => toAdminOrder(row, eventsByOrder.get(row.id) ?? [], itemsByOrder.get(row.id) ?? []));
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const payload = (await request.json()) as { id?: string; shippingAddress?: string | null };
  if (!payload.id) {
    return NextResponse.json({ message: "Order id is required." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const email = (auth.user.email ?? "").toLowerCase();

  const { data: orderRow, error: orderError } = await adminClient
    .from("orders")
    .select("id,customer_user_id,customer_email")
    .eq("id", payload.id)
    .single();

  if (orderError || !orderRow) {
    return NextResponse.json({ message: orderError?.message ?? "Order not found." }, { status: 404 });
  }

  const ownsOrder = orderRow.customer_user_id === auth.user.id || orderRow.customer_email?.toLowerCase() === email;
  if (!ownsOrder) {
    return NextResponse.json({ message: "You do not have access to this order." }, { status: 403 });
  }

  const { error: updateError } = await adminClient
    .from("orders")
    .update({
      customer_user_id: auth.user.id,
      shipping_address: payload.shippingAddress?.trim() || null,
    })
    .eq("id", payload.id);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
