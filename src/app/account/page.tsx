"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/auth-context";

type AccountOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  productionStage: string;
  totalAmount: number;
  currency: string;
  shippingAddress: string | null;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
};

function formatDate(dateValue: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AccountPage() {
  const { currentUser, isReady } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [shippingDrafts, setShippingDrafts] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState("");

  const loadOrders = async () => {
    if (!currentUser) {
      setOrders([]);
      setShippingDrafts({});
      return;
    }

    setIsLoadingOrders(true);
    const response = await fetch("/api/account/orders", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; orders?: AccountOrder[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load your orders.");
      setOrders([]);
      setShippingDrafts({});
      setIsLoadingOrders(false);
      return;
    }

    const nextOrders = payload.orders ?? [];
    setOrders(nextOrders);
    setShippingDrafts(
      nextOrders.reduce<Record<string, string>>((accumulator, order) => {
        accumulator[order.id] = order.shippingAddress ?? "";
        return accumulator;
      }, {}),
    );
    setErrorMessage("");
    setIsLoadingOrders(false);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void loadOrders();
  }, [currentUser, isReady]);

  const totalOpenOrders = useMemo(() => {
    return orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length;
  }, [orders]);

  const updateShippingAddress = async (orderId: string) => {
    setSavingOrderId(orderId);
    const response = await fetch("/api/account/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: orderId,
        shippingAddress: shippingDrafts[orderId] ?? "",
      }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save delivery address.");
      setSavingOrderId("");
      return;
    }

    setErrorMessage("");
    setSavingOrderId("");
    await loadOrders();
  };

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Your profile.</h1>

        {currentUser ? (
          <div className="mt-8 grid gap-6">
            <div className="grid gap-6 rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6 sm:p-8">
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Name</p>
                <p className="text-2xl tracking-[-0.03em] text-neutral-950">{currentUser.name}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Email</p>
                <p className="text-base text-neutral-800">{currentUser.email}</p>
              </div>
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Member since</p>
                <p className="text-base text-neutral-800">{formatDate(currentUser.createdAt)}</p>
              </div>
            </div>

            {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

            <section className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Orders</p>
                  <h2 className="mt-2 text-2xl tracking-[-0.03em] text-neutral-950">Delivery details</h2>
                </div>
                <p className="text-sm text-[var(--muted)]">Open orders: {totalOpenOrders}</p>
              </div>

              {isLoadingOrders ? (
                <p className="mt-5 text-sm text-[var(--muted)]">Loading your orders...</p>
              ) : orders.length === 0 ? (
                <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
                  No orders are linked to this account yet. Once an order is created with your email, it will appear here and you can add or update your delivery address.
                </p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {orders.map((order) => (
                    <article key={order.id} className="rounded-[24px] border border-[var(--line)] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Order {order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="mt-2 text-xl tracking-[-0.03em] text-neutral-950">{formatDate(order.orderDate)}</p>
                          <p className="mt-1 text-sm text-neutral-700">Status: {order.status.replaceAll("-", " ")}</p>
                        </div>
                        <div className="text-right text-sm text-neutral-700">
                          <p>Payment: {order.paymentStatus}</p>
                          <p>Stage: {order.productionStage.replaceAll("-", " ")}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-neutral-700">
                        {order.items.map((item) => (
                          <p key={item.id}>
                            {item.productName} x {item.quantity}
                          </p>
                        ))}
                      </div>

                      <label className="mt-5 grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                        Delivery address
                        <textarea
                          rows={4}
                          value={shippingDrafts[order.id] ?? ""}
                          onChange={(event) =>
                            setShippingDrafts((current) => ({
                              ...current,
                              [order.id]: event.target.value,
                            }))
                          }
                          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm normal-case text-neutral-900"
                          placeholder="Enter the address you want this order delivered to"
                        />
                      </label>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[var(--muted)]">This address is used by the admin shipping workflow for your order.</p>
                        <button
                          type="button"
                          onClick={() => {
                            void updateShippingAddress(order.id);
                          }}
                          disabled={savingOrderId === order.id}
                          className="rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                        >
                          {savingOrderId === order.id ? "Saving..." : "Save address"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-8 rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6 sm:p-8">
            <p className="text-base leading-8 text-[var(--muted)]">
              You are not logged in. Log in or create an account to continue.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/auth/login" className="rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white">
                Log in
              </Link>
              <Link href="/auth/signup" className="rounded-full border border-black bg-white px-5 py-2.5 text-sm text-black">
                Create account
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
