"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCustomerMoney, type AdminCustomer } from "@/lib/admin/customers";

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

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

export function AdminCustomersPageClient() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/customers", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as { message?: string; customers?: AdminCustomer[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load customers.");
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const nextCustomers = payload.customers ?? [];
    setErrorMessage("");
    setCustomers(nextCustomers);
    if (nextCustomers.length > 0 && !nextCustomers.some((item) => item.email === selectedEmail)) {
      setSelectedEmail(nextCustomers[0].email);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.email === selectedEmail) ?? null;
  }, [customers, selectedEmail]);

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Customers</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Customer relationships</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Track client lifetime value, consultations, measurements, and repeat orders in one view.
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
                  <th className="px-2 py-3">Customer</th>
                  <th className="px-2 py-3">Orders</th>
                  <th className="px-2 py-3">Consultations</th>
                  <th className="px-2 py-3">Lifetime Spend</th>
                  <th className="px-2 py-3">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-sm text-[var(--muted)]">Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-sm text-[var(--muted)]">No customer activity found yet.</td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.email}
                      className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${
                        selectedEmail === customer.email ? "bg-[var(--soft)]" : ""
                      }`}
                      onClick={() => setSelectedEmail(customer.email)}
                    >
                      <td className="px-2 py-3">
                        <p className="font-medium text-neutral-900">{customer.name}</p>
                        <p className="text-xs text-neutral-600">{customer.email}</p>
                      </td>
                      <td className="px-2 py-3 text-neutral-700">{customer.orderCount}</td>
                      <td className="px-2 py-3 text-neutral-700">{customer.consultationCount}</td>
                      <td className="px-2 py-3 text-neutral-900">{formatCustomerMoney(customer.lifetimeSpend)}</td>
                      <td className="px-2 py-3 text-neutral-700">{formatDate(customer.lastVisit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {selectedCustomer ? (
            <div className="grid gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl tracking-[-0.03em] text-neutral-950">{selectedCustomer.name}</h3>
                  {selectedCustomer.vip ? (
                    <span className="rounded-full border border-black bg-black px-3 py-1 text-xs uppercase tracking-[0.08em] text-white">
                      VIP
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-neutral-700">{selectedCustomer.email}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Orders</p>
                  <p className="mt-2 text-2xl text-neutral-950">{selectedCustomer.orderCount}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Consultations</p>
                  <p className="mt-2 text-2xl text-neutral-950">{selectedCustomer.consultationCount}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Lifetime Spend</p>
                  <p className="mt-2 text-2xl text-neutral-950">{formatCustomerMoney(selectedCustomer.lifetimeSpend)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Last Visit</p>
                  <p className="mt-2 text-base text-neutral-950">{formatDate(selectedCustomer.lastVisit)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Latest Measurements</p>
                {Object.keys(selectedCustomer.latestMeasurements).length === 0 ? (
                  <p className="mt-2">No measurements captured yet.</p>
                ) : (
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {Object.entries(selectedCustomer.latestMeasurements).map(([key, value]) => (
                      <p key={key}>
                        {key}: {String(value ?? "N/A")}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">Latest Notes</p>
                {selectedCustomer.latestNotes.length === 0 ? (
                  <p className="mt-2">No notes recorded yet.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {selectedCustomer.latestNotes.map((note) => (
                      <p key={note} className="rounded-xl bg-[var(--soft)] px-3 py-2">
                        {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a customer to view relationship details.</p>
          )}
        </section>
      </div>
    </div>
  );
}
