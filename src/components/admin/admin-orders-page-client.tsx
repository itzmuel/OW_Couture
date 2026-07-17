"use client";

import { useEffect, useMemo, useState } from "react";

import { toStageLabel, type AdminOrder, type AdminOrderAction } from "@/lib/admin/orders";

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

export function AdminOrdersPageClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const applyAction = async (action: AdminOrderAction) => {
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

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Orders</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Order management</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Track each couture order through approval, production, fitting, shipping, and delivery.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
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
                      <td className="px-2 py-3 text-neutral-700">{order.customerName}</td>
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

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {selectedOrder ? (
            <div className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Customer</p>
                <p className="mt-1 text-xl tracking-[-0.03em] text-neutral-950">{selectedOrder.customerName}</p>
                <p className="text-sm text-neutral-700">{selectedOrder.customerEmail}</p>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p><span className="font-medium text-neutral-900">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium text-neutral-900">Payment:</span> {selectedOrder.paymentStatus}</p>
                <p><span className="font-medium text-neutral-900">Stage:</span> {toStageLabel(selectedOrder.productionStage)}</p>
                <p><span className="font-medium text-neutral-900">Total:</span> {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                <p><span className="font-medium text-neutral-900">Date:</span> {formatDate(selectedOrder.orderDate)}</p>
              </div>

              <div className="grid gap-2 rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Measurements</p>
                {Object.keys(selectedOrder.measurements).length === 0 ? (
                  <p>No measurements captured.</p>
                ) : (
                  Object.entries(selectedOrder.measurements).map(([key, value]) => (
                    <p key={key}>
                      {key}: {value ?? "N/A"}
                    </p>
                  ))
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
                {selectedOrder.items.length === 0 ? (
                  <p>No line items added yet.</p>
                ) : (
                  selectedOrder.items.map((item) => (
                    <p key={item.id}>
                      {item.productName} x {item.quantity} ({formatCurrency(item.unitPrice, selectedOrder.currency)} each)
                    </p>
                  ))
                )}
                <p className="font-medium text-neutral-900">Uploaded Inspiration</p>
                {selectedOrder.inspirationUrls.length === 0 ? (
                  <p>No inspiration links added.</p>
                ) : (
                  selectedOrder.inspirationUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="underline">
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
                      className="rounded-full border border-black px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-neutral-900 transition hover:bg-black hover:text-white"
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
