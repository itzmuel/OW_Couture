"use client";

import { useEffect, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import {
  productionStageOrder,
  stageRank,
  toStageLabel,
  type AdminOrder,
  type ProductionStage,
} from "@/lib/admin/orders";

function nextProductionStage(stage: ProductionStage) {
  const currentIndex = stageRank(stage);
  const nextIndex = Math.min(currentIndex + 1, productionStageOrder.length - 1);
  return productionStageOrder[nextIndex];
}

export function AdminProductionPageClient() {
  const { hasPermission } = useAdminAccess();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/orders", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; orders?: AdminOrder[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load production orders.");
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setOrders(payload.orders ?? []);
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

  const advanceOrderStage = async (order: AdminOrder) => {
    if (!hasPermission("production:manage")) {
      return;
    }

    const nextStage = nextProductionStage(order.productionStage);

    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: order.id, productionStage: nextStage }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to update production stage.");
      return;
    }

    await loadOrders();
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Production</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Production tracker</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Manage each order from payment to shipping with stage-by-stage operational visibility.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">
          Loading production orders...
        </section>
      ) : orders.length === 0 ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">
          No production orders found.
        </section>
      ) : (
        <section className="grid gap-4">
          {orders.map((order) => {
            const currentRank = stageRank(order.productionStage);
            const stageLabel = toStageLabel(order.productionStage);

            return (
              <article key={order.id} className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <h3 className="mt-1 text-xl tracking-[-0.03em] text-neutral-950">{order.customerName}</h3>
                    <p className="text-sm text-neutral-700">Current stage: {stageLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void advanceOrderStage(order);
                    }}
                    disabled={order.productionStage === "complete" || !hasPermission("production:manage")}
                    className="rounded-full border border-black bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-600"
                  >
                    {order.productionStage === "complete" ? "Completed" : hasPermission("production:manage") ? "Advance to next stage" : "View only"}
                  </button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {productionStageOrder.map((stage) => {
                    const stageIndex = stageRank(stage);
                    const isDone = stageIndex <= currentRank;
                    return (
                      <div
                        key={stage}
                        className={`rounded-xl border px-3 py-2 text-xs uppercase tracking-[0.08em] ${
                          isDone
                            ? "border-black bg-black text-white"
                            : "border-[var(--line)] bg-white text-[var(--muted)]"
                        }`}
                      >
                        {toStageLabel(stage)}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
