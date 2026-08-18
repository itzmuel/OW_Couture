"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import {
  orderStatuses,
  paymentStatuses,
  productionStageOrder,
  toStageLabel,
  type AdminOrder,
  type AdminOrderAction,
  type OrderStatus,
  type PaymentStatus,
  type ProductionStage,
} from "@/lib/admin/orders";
import { products } from "@/data/products";

type EditableItem = {
  id: string;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type MeasurementEntry = {
  id: string;
  key: string;
  value: string;
};

type OrderDraft = {
  customerName: string;
  customerEmail: string;
  orderDate: string;
  notes: string;
  shippingAddress: string;
  inspirationText: string;
  currency: string;
};

function formatMeasurementLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toMeasurementEntries(measurements: Record<string, string | number | null>) {
  const entries = Object.entries(measurements).map(([key, value]) => {
    return {
      id: `${key}-${crypto.randomUUID()}`,
      key,
      value: value == null ? "" : String(value),
    } satisfies MeasurementEntry;
  });

  return entries.length > 0
    ? entries
    : [
        {
          id: `measurement-${crypto.randomUUID()}`,
          key: "",
          value: "",
        },
      ];
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const actions: Array<{ action: AdminOrderAction; label: string }> = [
  { action: "approve", label: "Approve" },
  { action: "start-production", label: "Start Production" },
  { action: "ready-for-fitting", label: "Ready for Fitting" },
  { action: "ready-to-ship", label: "Ready to Ship" },
  { action: "delivered", label: "Delivered" },
  { action: "cancel", label: "Cancel" },
];

function parseProductPrice(priceFrom: string) {
  const parsed = Number(priceFrom.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function AdminOrdersPageClient() {
  const { hasPermission } = useAdminAccess();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [itemDrafts, setItemDrafts] = useState<EditableItem[]>([]);
  const [measurementEntries, setMeasurementEntries] = useState<MeasurementEntry[]>([]);
  const [statusDraft, setStatusDraft] = useState<OrderStatus>("awaiting-review");
  const [paymentStatusDraft, setPaymentStatusDraft] = useState<PaymentStatus>("pending");
  const [stageDraft, setStageDraft] = useState<ProductionStage>("payment-received");
  const [isSavingItems, setIsSavingItems] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSavingState, setIsSavingState] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderDraft, setOrderDraft] = useState<OrderDraft>({
    customerName: "",
    customerEmail: "",
    orderDate: "",
    notes: "",
    shippingAddress: "",
    inspirationText: "",
    currency: "CAD",
  });

  const loadOrders = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/orders", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; orders?: AdminOrder[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load orders.");
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    const nextOrders = payload.orders ?? [];
    setOrders(nextOrders);
    if (nextOrders.length > 0 && !nextOrders.some((item) => item.id === selectedOrderId)) {
      setSelectedOrderId(nextOrders[0].id);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadOrders();

    const interval = window.setInterval(() => {
      void loadOrders();
    }, 12000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const selectedOrder = useMemo(() => {
    return orders.find((item) => item.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder) {
      setItemDrafts([]);
      setOrderDraft({
        customerName: "",
        customerEmail: "",
        orderDate: "",
        notes: "",
        shippingAddress: "",
        inspirationText: "",
        currency: "CAD",
      });
      setMeasurementEntries(toMeasurementEntries({}));
      setStatusDraft("awaiting-review");
      setPaymentStatusDraft("pending");
      setStageDraft("payment-received");
      return;
    }

    setItemDrafts(
      selectedOrder.items.map((item) => {
        return {
          id: item.id,
          productSlug: item.productSlug,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      }),
    );

    setOrderDraft({
      customerName: selectedOrder.customerName,
      customerEmail: selectedOrder.customerEmail,
      orderDate: selectedOrder.orderDate,
      notes: selectedOrder.notes ?? "",
      shippingAddress: selectedOrder.shippingAddress ?? "",
      inspirationText: selectedOrder.inspirationUrls.join("\n"),
      currency: selectedOrder.currency,
    });
    setMeasurementEntries(toMeasurementEntries(selectedOrder.measurements));
    setStatusDraft(selectedOrder.status);
    setPaymentStatusDraft(selectedOrder.paymentStatus);
    setStageDraft(selectedOrder.productionStage);
  }, [selectedOrder]);

  const applyAction = async (action: AdminOrderAction) => {
    if (!hasPermission("orders:manage")) {
      return;
    }

    if (!selectedOrder) {
      return;
    }

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedOrder.id, action }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to update order.");
      return;
    }

    setErrorMessage("");
    await loadOrders();
  };

  const addItemDraft = () => {
    const fallbackProduct = products[0];
    setItemDrafts((current) => {
      return [
        ...current,
        {
          id: `temp-${crypto.randomUUID()}`,
          productSlug: fallbackProduct.slug,
          productName: fallbackProduct.name,
          quantity: 1,
          unitPrice: parseProductPrice(fallbackProduct.priceFrom),
        },
      ];
    });
  };

  const updateItemDraft = (id: string, updates: Partial<EditableItem>) => {
    setItemDrafts((current) => {
      return current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          ...updates,
        };
      });
    });
  };

  const changeItemProduct = (id: string, productSlug: string) => {
    const selectedProduct = products.find((product) => product.slug === productSlug);
    if (!selectedProduct) {
      return;
    }

    updateItemDraft(id, {
      productSlug: selectedProduct.slug,
      productName: selectedProduct.name,
      unitPrice: parseProductPrice(selectedProduct.priceFrom),
    });
  };

  const removeItemDraft = (id: string) => {
    setItemDrafts((current) => current.filter((item) => item.id !== id));
  };

  const saveItemDrafts = async () => {
    if (!hasPermission("orders:manage")) {
      return;
    }

    if (!selectedOrder) {
      return;
    }

    setIsSavingItems(true);
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedOrder.id,
        items: itemDrafts,
      }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save order items.");
      setIsSavingItems(false);
      return;
    }

    setErrorMessage("");
    setIsSavingItems(false);
    await loadOrders();
  };

  const saveOrderDetails = async () => {
    if (!hasPermission("orders:manage")) {
      return;
    }

    if (!selectedOrder) {
      return;
    }

    const parsedMeasurements = measurementEntries.reduce<Record<string, string | number | null>>((accumulator, entry) => {
      const normalizedKey = entry.key.trim().toLowerCase().replace(/\s+/g, "_");
      const normalizedValue = entry.value.trim();

      if (!normalizedKey) {
        return accumulator;
      }

      accumulator[normalizedKey] = normalizedValue || null;
      return accumulator;
    }, {});

    setIsSavingOrder(true);
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedOrder.id,
        customerName: orderDraft.customerName,
        customerEmail: orderDraft.customerEmail,
        orderDate: orderDraft.orderDate,
        notes: orderDraft.notes,
        shippingAddress: orderDraft.shippingAddress,
        measurements: parsedMeasurements,
        inspirationUrls: orderDraft.inspirationText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        currency: orderDraft.currency,
      }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save order details.");
      setIsSavingOrder(false);
      return;
    }

    setErrorMessage("");
    setIsSavingOrder(false);
    await loadOrders();
  };

  const createOrder = async () => {
    if (!hasPermission("orders:manage")) {
      return;
    }

    setIsCreatingOrder(true);
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: "New Client",
        customerEmail: `client-${Date.now()}@example.com`,
        orderDate: today,
        notes: "",
        shippingAddress: "",
        measurements: {},
        inspirationUrls: [],
        currency: "CAD",
      }),
    });

    const payload = (await response.json()) as { id?: string; message?: string };
    if (!response.ok || !payload.id) {
      setErrorMessage(payload.message ?? "Unable to create order.");
      setIsCreatingOrder(false);
      return;
    }

    setErrorMessage("");
    await loadOrders();
    setSelectedOrderId(payload.id);
    setIsCreatingOrder(false);
  };

  const isMissingShippingAddress = !selectedOrder?.shippingAddress?.trim() && !orderDraft.shippingAddress.trim();

  const saveOrderState = async () => {
    if (!hasPermission("orders:manage") || !selectedOrder) {
      return;
    }

    setIsSavingState(true);
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedOrder.id,
        status: statusDraft,
        paymentStatus: paymentStatusDraft,
        productionStage: stageDraft,
      }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save order state.");
      setIsSavingState(false);
      return;
    }

    setErrorMessage("");
    setIsSavingState(false);
    await loadOrders();
  };

  const updateMeasurementEntry = (id: string, updates: Partial<MeasurementEntry>) => {
    setMeasurementEntries((current) => {
      return current.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        return {
          ...entry,
          ...updates,
        };
      });
    });
  };

  const addMeasurementEntry = () => {
    setMeasurementEntries((current) => [
      ...current,
      {
        id: `measurement-${crypto.randomUUID()}`,
        key: "",
        value: "",
      },
    ]);
  };

  const removeMeasurementEntry = (id: string) => {
    setMeasurementEntries((current) => {
      if (current.length === 1) {
        return [{ ...current[0], key: "", value: "" }];
      }

      return current.filter((entry) => entry.id !== id);
    });
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Orders</p>
            <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Order management</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Track each couture order through approval, production, fitting, shipping, and delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void createOrder();
            }}
            disabled={isCreatingOrder || !hasPermission("orders:manage")}
            className="rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
          >
            {isCreatingOrder ? "Creating..." : hasPermission("orders:manage") ? "Create order" : "View only"}
          </button>
        </div>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="min-w-0 rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Order #</th>
                  <th className="px-2 py-3">Customer</th>
                  <th className="px-2 py-3">Date</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Payment</th>
                  <th className="px-2 py-3">Production Stage</th>
                  <th className="px-2 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-2 py-6 text-sm text-[var(--muted)]">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-2 py-6 text-sm text-[var(--muted)]">
                      No orders yet. Add records in Supabase to begin tracking.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${
                        selectedOrderId === order.id ? "bg-[var(--soft)]" : ""
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="px-2 py-3 font-medium text-neutral-900">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-2 py-3 text-neutral-700">
                        <p>{order.customerName}</p>
                        {!order.shippingAddress?.trim() ? (
                          <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-amber-700">Missing delivery address</p>
                        ) : null}
                      </td>
                      <td className="px-2 py-3 text-neutral-700">{formatDate(order.orderDate)}</td>
                      <td className="px-2 py-3 text-neutral-700">{order.status}</td>
                      <td className="px-2 py-3 text-neutral-700">{order.paymentStatus}</td>
                      <td className="px-2 py-3 text-neutral-700">{toStageLabel(order.productionStage)}</td>
                      <td className="px-2 py-3 text-neutral-900">{formatCurrency(order.totalAmount, order.currency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {selectedOrder ? (
            <div className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Customer</p>
                <p className="mt-1 text-xl tracking-[-0.03em] text-neutral-950">{selectedOrder.customerName}</p>
                <p className="break-all text-sm text-neutral-700">{selectedOrder.customerEmail}</p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Edit order details</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Customer name
                    <input
                      value={orderDraft.customerName}
                      onChange={(event) => setOrderDraft((current) => ({ ...current, customerName: event.target.value }))}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Customer email
                    <input
                      type="email"
                      value={orderDraft.customerEmail}
                      onChange={(event) => setOrderDraft((current) => ({ ...current, customerEmail: event.target.value }))}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Order date
                    <input
                      type="date"
                      value={orderDraft.orderDate}
                      onChange={(event) => setOrderDraft((current) => ({ ...current, orderDate: event.target.value }))}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Currency
                    <input
                      value={orderDraft.currency}
                      onChange={(event) => setOrderDraft((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                </div>
                <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  Shipping address
                  <textarea
                    rows={3}
                    value={orderDraft.shippingAddress}
                    onChange={(event) => setOrderDraft((current) => ({ ...current, shippingAddress: event.target.value }))}
                    className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                </label>
                <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  Notes
                  <textarea
                    rows={4}
                    value={orderDraft.notes}
                    onChange={(event) => setOrderDraft((current) => ({ ...current, notes: event.target.value }))}
                    className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                </label>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Measurements</p>
                    <button
                      type="button"
                      onClick={addMeasurementEntry}
                      disabled={!hasPermission("orders:manage")}
                      className="rounded-full border border-black px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
                    >
                      Add measurement
                    </button>
                  </div>
                  <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-3">
                    {measurementEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-2 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_auto] sm:items-end">
                        <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                          Field
                          <input
                            value={entry.key}
                            onChange={(event) => updateMeasurementEntry(entry.id, { key: event.target.value })}
                            placeholder="e.g. bust"
                            className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm normal-case text-neutral-900"
                          />
                        </label>
                        <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                          Value
                          <input
                            value={entry.value}
                            onChange={(event) => updateMeasurementEntry(entry.id, { value: event.target.value })}
                            placeholder="e.g. 38"
                            className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm normal-case text-neutral-900"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeMeasurementEntry(entry.id)}
                          disabled={!hasPermission("orders:manage")}
                          className="rounded-full border border-black px-3 py-2 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  Inspiration links
                  <textarea
                    rows={4}
                    value={orderDraft.inspirationText}
                    onChange={(event) => setOrderDraft((current) => ({ ...current, inspirationText: event.target.value }))}
                    className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    void saveOrderDetails();
                  }}
                  disabled={isSavingOrder || !hasPermission("orders:manage")}
                  className="rounded-full border border-black bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                >
                  {isSavingOrder ? "Saving..." : hasPermission("orders:manage") ? "Save order details" : "View only"}
                </button>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p><span className="font-medium text-neutral-900">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium text-neutral-900">Payment:</span> {selectedOrder.paymentStatus}</p>
                <p><span className="font-medium text-neutral-900">Stage:</span> {toStageLabel(selectedOrder.productionStage)}</p>
                <p><span className="font-medium text-neutral-900">Total:</span> {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                <p><span className="font-medium text-neutral-900">Date:</span> {formatDate(selectedOrder.orderDate)}</p>
                {!selectedOrder.shippingAddress?.trim() ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                    Dispatch blocker: no delivery address has been added for this order yet.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-neutral-900">Order lifecycle controls</p>
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Manual admin controls</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Order status
                    <select
                      value={statusDraft}
                      onChange={(event) => setStatusDraft(event.target.value as OrderStatus)}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Payment status
                    <select
                      value={paymentStatusDraft}
                      onChange={(event) => setPaymentStatusDraft(event.target.value as PaymentStatus)}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                    Production stage
                    <select
                      value={stageDraft}
                      onChange={(event) => setStageDraft(event.target.value as ProductionStage)}
                      className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      {productionStageOrder.map((stage) => (
                        <option key={stage} value={stage}>
                          {toStageLabel(stage)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[var(--muted)]">
                    Use these when you need to set shipping readiness or delivery directly.
                    {isMissingShippingAddress ? " Add a delivery address first before setting ready to ship." : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void saveOrderState();
                    }}
                    disabled={
                      isSavingState ||
                      !hasPermission("orders:manage") ||
                      (statusDraft === "ready-to-ship" && isMissingShippingAddress)
                    }
                    className="rounded-full border border-black bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                  >
                    {isSavingState ? "Saving..." : hasPermission("orders:manage") ? "Save lifecycle state" : "View only"}
                  </button>
                </div>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Measurements</p>
                {Object.keys(selectedOrder.measurements).length === 0 ? (
                  <p>No measurements captured.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(selectedOrder.measurements).map(([key, value]) => (
                      <p key={key} className="rounded-xl bg-[var(--soft)] px-3 py-2">
                        <span className="font-medium text-neutral-900">{formatMeasurementLabel(key)}:</span>{" "}
                        {value ?? "N/A"}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Notes</p>
                <p>{selectedOrder.notes || "No notes added yet."}</p>
                <p className="font-medium text-neutral-900">Shipping</p>
                <p>{selectedOrder.shippingAddress || "Shipping address not added yet."}</p>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Products Ordered</p>
                {itemDrafts.length === 0 ? <p>No line items added yet.</p> : null}
                <div className="grid gap-3">
                  {itemDrafts.map((item) => (
                    <div key={item.id} className="grid gap-3 rounded-2xl border border-[var(--line)] p-3">
                      <div className="grid gap-2">
                        <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                          Product
                          <select
                            value={item.productSlug}
                            onChange={(event) => changeItemProduct(item.id, event.target.value)}
                            className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          >
                            {products.map((product) => (
                              <option key={product.slug} value={product.slug}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                            Quantity
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) => updateItemDraft(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                              className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                            />
                          </label>
                          <label className="grid min-w-0 gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                            Unit Price
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(event) => updateItemDraft(item.id, { unitPrice: Math.max(0, Number(event.target.value) || 0) })}
                              className="min-w-0 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-start md:justify-end">
                        <button
                          type="button"
                          onClick={() => removeItemDraft(item.id)}
                          disabled={!hasPermission("orders:manage")}
                          className="rounded-full border border-black px-3 py-2 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addItemDraft}
                    disabled={!hasPermission("orders:manage")}
                    className="rounded-full border border-black px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
                  >
                    Add product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void saveItemDrafts();
                    }}
                    disabled={isSavingItems || !hasPermission("orders:manage")}
                    className="rounded-full border border-black bg-black px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:border-neutral-300"
                  >
                    {isSavingItems ? "Saving..." : hasPermission("orders:manage") ? "Save products" : "View only"}
                  </button>
                </div>
                <p className="font-medium text-neutral-900">Uploaded Inspiration</p>
                {selectedOrder.inspirationUrls.length === 0 ? (
                  <p>No inspiration links added.</p>
                ) : (
                  selectedOrder.inspirationUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="break-all underline">
                      {url}
                    </a>
                  ))
                )}
              </div>

              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {actions.map((item) => (
                    <button
                      key={item.action}
                      type="button"
                      onClick={() => {
                        void applyAction(item.action);
                      }}
                      disabled={
                        !hasPermission("orders:manage") ||
                        (item.action === "ready-to-ship" && isMissingShippingAddress)
                      }
                      className="rounded-full border border-black px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
                      title={
                        item.action === "ready-to-ship" && isMissingShippingAddress
                          ? "Add a delivery address before marking this order ready to ship."
                          : undefined
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select an order to view details and timeline actions.</p>
          )}
        </section>
      </div>
    </div>
  );
}
