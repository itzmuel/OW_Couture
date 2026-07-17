"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminMeasurementProfile } from "@/lib/admin/measurements";

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

export function AdminMeasurementsPageClient() {
  const [profiles, setProfiles] = useState<AdminMeasurementProfile[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProfiles = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/measurements", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; profiles?: AdminMeasurementProfile[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load measurements.");
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    const nextProfiles = payload.profiles ?? [];
    setErrorMessage("");
    setProfiles(nextProfiles);
    if (nextProfiles.length > 0 && !nextProfiles.some((item) => item.email === selectedEmail)) {
      setSelectedEmail(nextProfiles[0].email);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadProfiles();
  }, []);

  const selectedProfile = useMemo(() => {
    return profiles.find((profile) => profile.email === selectedEmail) ?? null;
  }, [profiles, selectedEmail]);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Measurements</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Measurement records</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Review latest body measurements and compare measurement history across client orders.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Client</th>
                  <th className="px-2 py-3">Latest Order</th>
                  <th className="px-2 py-3">History</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-sm text-[var(--muted)]">Loading measurement records...</td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-sm text-[var(--muted)]">No measurement records found yet.</td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr
                      key={profile.email}
                      className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${
                        selectedEmail === profile.email ? "bg-[var(--soft)]" : ""
                      }`}
                      onClick={() => setSelectedEmail(profile.email)}
                    >
                      <td className="px-2 py-3">
                        <p className="font-medium text-neutral-900">{profile.customerName}</p>
                        <p className="text-xs text-neutral-600">{profile.email}</p>
                      </td>
                      <td className="px-2 py-3 text-neutral-700">{formatDate(profile.latestOrderDate)}</td>
                      <td className="px-2 py-3 text-neutral-700">{profile.history.length} snapshots</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {selectedProfile ? (
            <div className="grid gap-4">
              <div>
                <h3 className="text-2xl tracking-[-0.03em] text-neutral-950">{selectedProfile.customerName}</h3>
                <p className="mt-1 text-sm text-neutral-700">{selectedProfile.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Latest order {selectedProfile.latestOrderId.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Latest Measurements</p>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {Object.entries(selectedProfile.latestMeasurements).map(([key, value]) => (
                    <p key={key}>
                      {key}: {String(value ?? "N/A")}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Measurement History</p>
                <div className="mt-3 grid gap-3">
                  {selectedProfile.history.map((snapshot) => (
                    <div key={snapshot.orderId} className="rounded-xl border border-[var(--line)] px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                        {formatDate(snapshot.orderDate)} · Order {snapshot.orderId.slice(0, 8).toUpperCase()}
                      </p>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        {Object.entries(snapshot.measurements).map(([key, value]) => (
                          <p key={`${snapshot.orderId}-${key}`}>
                            {key}: {String(value ?? "N/A")}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a client to inspect measurement history.</p>
          )}
        </section>
      </div>
    </div>
  );
}
