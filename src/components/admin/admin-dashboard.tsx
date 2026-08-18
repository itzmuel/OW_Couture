"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-context";
import type { AdminDashboardPayload } from "@/lib/admin/dashboard";

const quickActions = [
  { label: "Review Orders", href: "/admin/orders" },
  { label: "Open Production Tracker", href: "/admin/production" },
  { label: "Manage Consultations", href: "/admin/consultations" },
  { label: "Edit Website Content", href: "/admin/website" },
];

function formatChartValue(value: number, valueFormat: "currency" | "number") {
  if (valueFormat === "currency") {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(value);
}

function formatAxisTickValue(value: number, valueFormat: "currency" | "number") {
  if (valueFormat === "currency") {
    if (value >= 1_000_000) {
      return `$${Math.round(value / 1_000_000)}M`;
    }

    if (value >= 1_000) {
      return `$${Math.round(value / 1_000)}K`;
    }

    return `$${Math.round(value)}`;
  }

  return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(value);
}

function formatBarTopValue(value: number, valueFormat: "currency" | "number") {
  if (valueFormat === "currency") {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }

    return `$${value.toFixed(1)}`;
  }

  return new Intl.NumberFormat("en-CA", { maximumFractionDigits: 1 }).format(value);
}

export function AdminDashboard() {
  const { currentUser } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const signedInFirstName = currentUser?.name.trim().split(" ")[0];
  const greetingName = signedInFirstName || dashboard?.greetingName || "there";

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
          Good morning, {greetingName}
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
          const minValue = tile.values.length > 0 ? Math.min(...tile.values) : 0;
          const avgValue = tile.values.length > 0 ? tile.values.reduce((sum, current) => sum + current, 0) / tile.values.length : 0;
          const chartHeight = 270;
          const yTickFractions = [1, 0.75, 0.5, 0.25, 0];
          const useAngledLabels = tile.labels.length > 6 || tile.labels.some((label) => label.length > 4);

          return (
            <article key={tile.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg tracking-[-0.03em] text-neutral-950">{tile.title}</h3>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{tile.subtitle}</p>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--line)] p-3 text-xs uppercase tracking-[0.08em] text-[var(--muted)] sm:grid-cols-3">
                <p>
                  Min: <span className="font-medium text-neutral-950 normal-case">{formatChartValue(minValue, tile.valueFormat)}</span>
                </p>
                <p>
                  Avg: <span className="font-medium text-neutral-950 normal-case">{formatChartValue(avgValue, tile.valueFormat)}</span>
                </p>
                <p>
                  Max: <span className="font-medium text-neutral-950 normal-case">{formatChartValue(maxValue, tile.valueFormat)}</span>
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-neutral-100 p-4">
                <p className="text-sm font-medium text-neutral-900">
                  {tile.title} {tile.valueFormat === "currency" ? "($M)" : "(Count)"}
                </p>

                <div className="mt-4 grid grid-cols-[58px_1fr] gap-2">
                  <div className="relative" style={{ height: `${chartHeight}px` }}>
                    <div className="absolute inset-y-0 right-0 border-r-2 border-neutral-800" />
                    {yTickFractions.map((fraction) => (
                      <div
                        key={`${tile.title}-tick-${fraction}`}
                        className="absolute right-1 flex items-center gap-2"
                        style={{ top: `${(1 - fraction) * 100}%` }}
                      >
                        <span className="text-xs text-neutral-700">{formatAxisTickValue(maxValue * fraction, tile.valueFormat)}</span>
                        <span className="h-px w-2 bg-neutral-800" />
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    {yTickFractions
                      .filter((fraction) => fraction > 0)
                      .map((fraction) => (
                        <div
                          key={`${tile.title}-grid-${fraction}`}
                          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-300"
                          style={{ bottom: `${fraction * 100}%` }}
                        />
                      ))}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-neutral-800" />

                    <div className="flex h-full items-end gap-3 px-2" style={{ height: `${chartHeight}px` }}>
                      {tile.values.map((value, index) => (
                        <div key={`${tile.title}-${index}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                          <p className="mb-1 h-4 truncate text-center text-[10px] font-medium text-neutral-900">
                            {formatBarTopValue(value, tile.valueFormat)}
                          </p>
                          <div className="relative flex h-full items-end justify-center">
                            <div
                              className="w-full max-w-[64px] rounded-t-[2px] bg-[#90a099] transition hover:brightness-95"
                              style={{
                                height: `${Math.max((value / maxValue) * 100, value > 0 ? 6 : 1)}%`,
                                minHeight: value > 0 ? "10px" : "2px",
                              }}
                              title={`${tile.labels[index] ?? `Point ${index + 1}`}: ${formatChartValue(value, tile.valueFormat)}`}
                            />
                          </div>
                          <p className={`mt-2 h-8 text-center text-xs text-neutral-800 ${useAngledLabels ? "" : "truncate"}`}>
                            <span
                              className={`inline-block ${useAngledLabels ? "whitespace-nowrap" : ""}`}
                              style={useAngledLabels ? { transform: "rotate(-18deg)", transformOrigin: "top left" } : undefined}
                              title={tile.labels[index] ?? `P${index + 1}`}
                            >
                              {tile.labels[index] ?? `P${index + 1}`}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
