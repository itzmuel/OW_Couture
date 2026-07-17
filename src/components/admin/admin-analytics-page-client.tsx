"use client";

import { useEffect, useState } from "react";

import { formatAnalyticsCurrency, type AdminAnalyticsPayload } from "@/lib/admin/analytics";

export function AdminAnalyticsPageClient() {
  const [data, setData] = useState<AdminAnalyticsPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      const response = await fetch("/api/admin/analytics", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminAnalyticsPayload & { message?: string };
      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        setErrorMessage(payload.message ?? "Unable to load analytics.");
        setData(null);
        setIsLoading(false);
        return;
      }

      setErrorMessage("");
      setData(payload);
      setIsLoading(false);
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Analytics</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Business analytics</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Track revenue, order performance, consultation volume, and repeat-customer signals across the couture business.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.kpis ?? []).map((kpi) => (
          <article key={kpi.label} className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{kpi.label}</p>
            <p className="mt-3 text-3xl tracking-[-0.04em] text-neutral-950">{kpi.value}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{kpi.helper}</p>
          </article>
        ))}
        {isLoading
          ? Array.from({ length: 2 }).map((_, index) => (
              <article key={`analytics-loading-${index}`} className="rounded-[24px] border border-[var(--line)] bg-white p-4">
                <div className="h-3 w-24 rounded bg-neutral-200" />
                <div className="mt-4 h-8 w-28 rounded bg-neutral-200" />
              </article>
            ))
          : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(data?.charts ?? []).map((chart) => {
          const maxValue = Math.max(...chart.values, 1);
          return (
            <article key={chart.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg tracking-[-0.03em] text-neutral-950">{chart.title}</h3>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{chart.labels.join(" · ")}</p>
              </div>
              <div className="mt-5 flex h-32 items-end gap-2">
                {chart.values.map((value, index) => (
                  <div key={`${chart.title}-${chart.labels[index]}`} className="min-w-0 flex-1">
                    <div
                      className="rounded-t-lg bg-black/85"
                      style={{ height: `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 2)}%` }}
                      title={chart.format === "currency" ? formatAnalyticsCurrency(value) : String(value)}
                    />
                    <p className="mt-2 text-center text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">{chart.labels[index]}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      {data?.insights?.length ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Insights</h3>
          <div className="mt-4 grid gap-3">
            {data.insights.map((insight) => (
              <p key={insight} className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)]">
                {insight}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
