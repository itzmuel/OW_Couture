import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { ensureAdminUser } from "@/lib/supabase/admin-auth";
import {
  isAdminOrderAction,
  isOrderStatus,
  isPaymentStatus,
  isProductionStage,
  productionStageOrder,
  stageRank,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
  type ProductionStage,
} from "@/lib/admin/orders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type OrderRow = {
  id: string;
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

type EditableOrderPayload = {
  customerName?: string;
  customerEmail?: string;
  orderDate?: string;
  notes?: string | null;
  shippingAddress?: string | null;
  measurements?: Record<string, string | number | null>;
  inspirationUrls?: string[];
  currency?: string;
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
    items: items.map((item) => {
      return {
        id: item.id,
        productSlug: item.product_slug,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price ?? 0),
      };
    }),
  };
}

async function syncProductionEvents(orderId: string, productionStage: ProductionStage) {
  const adminClient = createSupabaseAdminClient();
  const cutoff = stageRank(productionStage);
  const completedStages = productionStageOrder.filter((stage) => stageRank(stage) <= cutoff);
  const remainingStages = productionStageOrder.filter((stage) => stageRank(stage) > cutoff);

  if (completedStages.length > 0) {
    const { error: completeError } = await adminClient
      .from("order_production_events")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .in("stage", completedStages);

    if (completeError) {
      return completeError.message;
    }
  }

  if (remainingStages.length > 0) {
    const { error: pendingError } = await adminClient
      .from("order_production_events")
      .update({ completed: false, completed_at: null })
      .eq("order_id", orderId)
      .in("stage", remainingStages);

    if (pendingError) {
      return pendingError.message;
    }
  }

  return null;
}

function normalizeEditableOrderPayload(payload: EditableOrderPayload) {
  const customerName = payload.customerName?.trim();
  const customerEmail = payload.customerEmail?.trim().toLowerCase();
  const orderDate = payload.orderDate?.trim();
  const currency = payload.currency?.trim().toUpperCase() || "CAD";

  if (!customerName) {
    return { ok: false as const, message: "Customer name is required." };
  }

  if (!customerEmail) {
    return { ok: false as const, message: "Customer email is required." };
  }

  if (!orderDate) {
    return { ok: false as const, message: "Order date is required." };
  }

  return {
    ok: true as const,
    value: {
      customer_name: customerName,
      customer_email: customerEmail,
      order_date: orderDate,
      notes: payload.notes?.trim() || null,
      shipping_address: payload.shippingAddress?.trim() || null,
      measurements: payload.measurements ?? {},
      inspiration_urls: payload.inspirationUrls ?? [],
      currency,
    },
  };
}

export async function POST(request: Request) {
  const adminCheck = await ensureAdminUser("orders:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as EditableOrderPayload;
  const normalized = normalizeEditableOrderPayload(payload);

  if (!normalized.ok) {
    return NextResponse.json({ message: normalized.message }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("orders")
    .insert({
      ...normalized.value,
      status: "awaiting-review",
      payment_status: "pending",
      production_stage: "payment-received",
      total_amount: 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const adminCheck = await ensureAdminUser("orders:view");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("orders")
    .select(
      "id,customer_name,customer_email,order_date,status,payment_status,production_stage,total_amount,currency,notes,measurements,inspiration_urls,shipping_address,created_at,updated_at",
    )
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

  const { data: eventData, error: eventError } = eventsResult;

  if (eventError) {
    return NextResponse.json({ message: eventError.message }, { status: 500 });
  }

  const { data: itemData, error: itemError } = itemsResult;
  if (itemError) {
    return NextResponse.json({ message: itemError.message }, { status: 500 });
  }

  const eventsByOrder = new Map<string, EventRow[]>();
  (eventData ?? []).forEach((eventRow) => {
    const typedRow = eventRow as EventRow;
    const existing = eventsByOrder.get(typedRow.order_id) ?? [];
    existing.push(typedRow);
    eventsByOrder.set(typedRow.order_id, existing);
  });

  const itemsByOrder = new Map<string, ItemRow[]>();
  (itemData ?? []).forEach((itemRow) => {
    const typedRow = itemRow as ItemRow;
    const existing = itemsByOrder.get(typedRow.order_id) ?? [];
    existing.push(typedRow);
    itemsByOrder.set(typedRow.order_id, existing);
  });

  const orders = rows.map((row) => toAdminOrder(row, eventsByOrder.get(row.id) ?? [], itemsByOrder.get(row.id) ?? []));
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const adminCheck = await ensureAdminUser("orders:manage");
  if (!adminCheck.ok) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status });
  }

  const payload = (await request.json()) as {
    id?: string;
    action?: string;
    status?: string;
    paymentStatus?: string;
    productionStage?: string;
    customerName?: string;
    customerEmail?: string;
    orderDate?: string;
    notes?: string | null;
    shippingAddress?: string | null;
    measurements?: Record<string, string | number | null>;
    inspirationUrls?: string[];
    currency?: string;
    items?: Array<{
      id?: string;
      productSlug?: string;
      productName?: string;
      quantity?: number;
      unitPrice?: number;
    }>;
  };

  if (!payload.id) {
    return NextResponse.json({ message: "Order id is required." }, { status: 400 });
  }

  if (payload.action && !isAdminOrderAction(payload.action)) {
    return NextResponse.json({ message: "Invalid action provided." }, { status: 400 });
  }

  if (payload.status && !isOrderStatus(payload.status)) {
    return NextResponse.json({ message: "Invalid order status provided." }, { status: 400 });
  }

  if (payload.paymentStatus && !isPaymentStatus(payload.paymentStatus)) {
    return NextResponse.json({ message: "Invalid payment status provided." }, { status: 400 });
  }

  if (payload.productionStage && !isProductionStage(payload.productionStage)) {
    return NextResponse.json({ message: "Invalid production stage provided." }, { status: 400 });
  }

  const isEditingOrderDetails = Boolean(
    payload.customerName !== undefined ||
      payload.customerEmail !== undefined ||
      payload.orderDate !== undefined ||
      payload.notes !== undefined ||
      payload.shippingAddress !== undefined ||
      payload.measurements !== undefined ||
      payload.inspirationUrls !== undefined ||
      payload.currency !== undefined,
  );

  const normalizedOrderDetails = isEditingOrderDetails
    ? normalizeEditableOrderPayload({
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        orderDate: payload.orderDate,
        notes: payload.notes,
        shippingAddress: payload.shippingAddress,
        measurements: payload.measurements,
        inspirationUrls: payload.inspirationUrls,
        currency: payload.currency,
      })
    : null;

  if (normalizedOrderDetails && !normalizedOrderDetails.ok) {
    return NextResponse.json({ message: normalizedOrderDetails.message }, { status: 400 });
  }

  if (payload.items) {
    const hasInvalidItem = payload.items.some((item) => {
      return (
        !item.productSlug ||
        !item.productName ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0 ||
        typeof item.unitPrice !== "number" ||
        item.unitPrice < 0
      );
    });

    if (hasInvalidItem) {
      return NextResponse.json({ message: "Each order item needs product, quantity, and unit price." }, { status: 400 });
    }
  }

  const adminClient = createSupabaseAdminClient();
  const { data: existingData, error: existingError } = await adminClient
    .from("orders")
    .select("id,status,payment_status,production_stage")
    .eq("id", payload.id)
    .single();

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 404 });
  }

  const existingStatus = isOrderStatus(existingData.status) ? existingData.status : "awaiting-review";
  const existingPaymentStatus = isPaymentStatus(existingData.payment_status)
    ? existingData.payment_status
    : "pending";
  const existingStage = isProductionStage(existingData.production_stage)
    ? existingData.production_stage
    : "payment-received";

  let nextStatus: OrderStatus = existingStatus;
  let nextPaymentStatus: PaymentStatus = existingPaymentStatus;
  let nextStage: ProductionStage = existingStage;

  if (payload.action) {
    if (payload.action === "approve") {
      nextStatus = "approved";
      nextStage = "payment-received";
    } else if (payload.action === "start-production") {
      nextStatus = "in-production";
      nextStage = "measurements-verified";
    } else if (payload.action === "ready-for-fitting") {
      nextStatus = "ready-for-fitting";
      nextStage = "quality-inspection";
    } else if (payload.action === "ready-to-ship") {
      nextStatus = "ready-to-ship";
      nextStage = "packaging";
    } else if (payload.action === "delivered") {
      nextStatus = "delivered";
      nextPaymentStatus = "paid";
      nextStage = "complete";
    } else if (payload.action === "cancel") {
      nextStatus = "cancelled";
      nextPaymentStatus = "cancelled";
    }
  }

  if (payload.status && isOrderStatus(payload.status)) {
    nextStatus = payload.status;
  }

  if (payload.paymentStatus && isPaymentStatus(payload.paymentStatus)) {
    nextPaymentStatus = payload.paymentStatus;
  }

  if (payload.productionStage && isProductionStage(payload.productionStage)) {
    nextStage = payload.productionStage;
  }

  const updatePayload: {
    status: OrderStatus;
    payment_status: PaymentStatus;
    production_stage: ProductionStage;
    total_amount?: number;
  } = {
    status: nextStatus,
    payment_status: nextPaymentStatus,
    production_stage: nextStage,
  };

  if (payload.items) {
    updatePayload.total_amount = payload.items.reduce((sum, item) => {
      return sum + (item.quantity ?? 0) * (item.unitPrice ?? 0);
    }, 0);
  }

  if (normalizedOrderDetails?.ok) {
    Object.assign(updatePayload, normalizedOrderDetails.value);
  }

  const { error: updateError } = await adminClient
    .from("orders")
    .update(updatePayload)
    .eq("id", payload.id);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  if (payload.items) {
    const { error: deleteItemsError } = await adminClient
      .from("order_items")
      .delete()
      .eq("order_id", payload.id);

    if (deleteItemsError) {
      return NextResponse.json({ message: deleteItemsError.message }, { status: 500 });
    }

    if (payload.items.length > 0) {
      const replacementItems = payload.items.map((item) => {
        return {
          id: item.id && item.id.startsWith("temp-") ? randomUUID() : item.id ?? randomUUID(),
          order_id: payload.id,
          product_slug: item.productSlug,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        };
      });

      const { error: insertItemsError } = await adminClient.from("order_items").insert(replacementItems);
      if (insertItemsError) {
        return NextResponse.json({ message: insertItemsError.message }, { status: 500 });
      }
    }
  }

  const syncError = await syncProductionEvents(payload.id, nextStage);
  if (syncError) {
    return NextResponse.json({ message: syncError }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
