"use client";

import { useEffect, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import { formatPaymentMoney, type AdminPaymentsPayload } from "@/lib/admin/payments";

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

const paymentActions = ["paid", "pending", "refunded", "cancelled"] as const;

export function AdminPaymentsPageClient() {
  const { hasPermission } = useAdminAccess();
  const [data, setData] = useState<AdminPaymentsPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingOrderId, setIsUpdatingOrderId] = useState("");

  const loadPayments = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/payments", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as AdminPaymentsPayload & { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load payments.");
      setData(null);
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setData(payload);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const updatePaymentStatus = async (orderId: string, paymentStatus: (typeof paymentActions)[number]) => {
    if (!hasPermission("payments:manage")) {
      return;
    }

    setIsUpdatingOrderId(orderId);
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: orderId, paymentStatus }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to update payment state.");
      setIsUpdatingOrderId("");
      return;
    }

    setErrorMessage("");
    setIsUpdatingOrderId("");
    await loadPayments();
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Payments</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Payment control center</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Review paid, pending, refunded, and cancelled payments across all couture orders.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[24px] border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Paid</p>
          <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{data?.summary.paid ?? 0}</p>
        </article>
        <article className="rounded-[24px] border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Pending</p>
          <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{data?.summary.pending ?? 0}</p>
        </article>
        <article className="rounded-[24px] border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Refunded</p>
          <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{data?.summary.refunded ?? 0}</p>
        </article>
        <article className="rounded-[24px] border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cancelled</p>
          <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{data?.summary.cancelled ?? 0}</p>
        </article>
        <article className="rounded-[24px] border border-[var(--line)] bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Paid Revenue</p>
          <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{formatPaymentMoney(data?.summary.totalRevenue ?? 0)}</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <th className="px-2 py-3">Order #</th>
                <th className="px-2 py-3">Customer</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Order Status</th>
                <th className="px-2 py-3">Payment</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-sm text-[var(--muted)]">Loading payments...</td>
                </tr>
              ) : data && data.payments.length > 0 ? (
                data.payments.map((payment) => (
                  <tr key={payment.orderId} className="border-b border-[var(--line)]">
                    <td className="px-2 py-3 font-medium text-neutral-900">{payment.orderId.slice(0, 8).toUpperCase()}</td>
                    <td className="px-2 py-3">
                      <p className="text-neutral-900">{payment.customerName}</p>
                      <p className="text-xs text-neutral-600">{payment.customerEmail}</p>
                    </td>
                    <td className="px-2 py-3 text-neutral-700">{formatDate(payment.orderDate)}</td>
                    <td className="px-2 py-3 text-neutral-700">{payment.orderStatus}</td>
                    <td className="px-2 py-3 text-neutral-700">{payment.paymentStatus}</td>
                    <td className="px-2 py-3 text-neutral-900">{formatPaymentMoney(payment.amount, payment.currency)}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        {paymentActions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={isUpdatingOrderId === payment.orderId || !hasPermission("payments:manage")}
                            onClick={() => {
                              void updatePaymentStatus(payment.orderId, status);
                            }}
                            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.08em] transition ${
                              payment.paymentStatus === status
                                ? "border-black bg-black text-white"
                                : "border-[var(--line)] bg-white text-neutral-700 hover:border-black"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-sm text-[var(--muted)]">No payment activity found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
