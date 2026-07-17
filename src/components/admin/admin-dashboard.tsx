"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { AdminDashboardPayload } from "@/lib/admin/dashboard";

const quickActions = [
  { label: "Review Orders", href: "/admin/orders" },
  { label: "Open Production Tracker", href: "/admin/production" },
  { label: "Manage Consultations", href: "/admin/consultations" },
  { label: "Edit Website Content", href: "/admin/website" },
];

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminDashboardPayload & { message?: string };
      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        setErrorMessage(payload.message ?? "Unable to load dashboard metrics.");
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      setErrorMessage("");
      setDashboard(payload);
      setIsLoading(false);
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Dashboard</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,52px)] leading-[1] tracking-[-0.05em] text-neutral-950">
          Good morning, {dashboard?.greetingName ?? "Olivia"}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          This command center tracks revenue, orders, production flow, consultations, and customer engagement in one place.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(dashboard?.summaryCards ?? []).map((item) => (
          <article key={item.label} className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{item.value}</p>
          </article>
        ))}
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={`loading-card-${index}`} className="rounded-[24px] border border-[var(--line)] bg-white p-4">
                <div className="h-3 w-28 rounded bg-neutral-200" />
                <div className="mt-4 h-8 w-20 rounded bg-neutral-200" />
              </article>
            ))
          : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(dashboard?.chartTiles ?? []).map((tile) => {
          const maxValue = Math.max(...tile.values, 1);

          return (
          <article key={tile.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg tracking-[-0.03em] text-neutral-950">{tile.title}</h3>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{tile.subtitle}</p>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2">
              {tile.values.map((value, index) => (
                <div
                  key={`${tile.title}-${index}`}
                  className="min-w-0 flex-1 rounded-t-lg bg-black/85"
                  style={{ height: `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 2)}%` }}
                  title={`${tile.title}: ${value}`}
                />
              ))}
            </div>
          </article>
          );
        })}
      </section>

      {dashboard?.notes?.length ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Operational notes</h3>
          <div className="mt-4 grid gap-3">
            {dashboard.notes.map((note) => (
              <p key={note} className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)]">
                {note}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl tracking-[-0.04em] text-neutral-950">Quick actions</h3>
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Operations</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-800 transition hover:border-black hover:bg-[var(--soft)]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
