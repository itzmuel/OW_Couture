"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type ConsultationStatus,
  type ConsultationSubmission,
} from "@/data/consultation-submissions";
import { products } from "@/data/products";

function formatSubmittedDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusButton({
  label,
  isActive,
  onClick,
}: {
  label: ConsultationStatus;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.08em] transition ${
        isActive ? "border-black bg-black text-white" : "border-[var(--line)] bg-white text-neutral-700 hover:border-black"
      }`}
    >
      {label}
    </button>
  );
}

export function AdminPageClient() {
  const [submissions, setSubmissions] = useState<ConsultationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/consultations", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      message?: string;
      submissions?: Array<{
        id: string;
        user_id: string | null;
        name: string;
        email: string;
        phone: string;
        requested_date: string | null;
        requested_time: string | null;
        consultation_type: string;
        request: string;
        status: ConsultationStatus;
        created_at: string;
      }>;
    };

    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load admin submissions.");
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    const mappedSubmissions = (payload.submissions ?? []).map((row) => {
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        date: row.requested_date ?? "",
        time: row.requested_time ?? "",
        consultationType: row.consultation_type,
        request: row.request,
        status: row.status,
        submittedAt: row.created_at,
      } satisfies ConsultationSubmission;
    });

    setSubmissions(mappedSubmissions);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchSubmissions();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchSubmissions();
    }, 12000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const productByCollection = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.collection] = (acc[product.collection] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const submissionSummary = useMemo(() => {
    return {
      total: submissions.length,
      new: submissions.filter((item) => item.status === "new").length,
      inProgress: submissions.filter((item) => item.status === "in-progress").length,
      confirmed: submissions.filter((item) => item.status === "confirmed").length,
    };
  }, [submissions]);

  const setStatus = async (id: string, status: ConsultationStatus) => {
    const response = await fetch("/api/admin/consultations", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setErrorMessage(payload.message ?? "Unable to update submission status.");
      return;
    }

    await fetchSubmissions();
  };

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Admin</p>
            <h1 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Back office overview.</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Review consultation intake and track product inventory coverage by collection.
            </p>
          </div>
          <Link href="/consultation" className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5">
            Open consultation page
          </Link>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-scroll-reveal>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Consultation requests</p>
            <p className="mt-3 text-4xl leading-none tracking-[-0.04em] text-neutral-950">{submissionSummary.total}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">New</p>
            <p className="mt-3 text-4xl leading-none tracking-[-0.04em] text-neutral-950">{submissionSummary.new}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">In progress</p>
            <p className="mt-3 text-4xl leading-none tracking-[-0.04em] text-neutral-950">{submissionSummary.inProgress}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Confirmed</p>
            <p className="mt-3 text-4xl leading-none tracking-[-0.04em] text-neutral-950">{submissionSummary.confirmed}</p>
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-7" data-scroll-reveal data-scroll-direction="left">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-3xl tracking-[-0.04em] text-neutral-950">Consultation submissions</h2>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Supabase admin view</p>
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{errorMessage}</p>
            ) : null}

            {isLoading ? (
              <p className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                Loading consultation submissions...
              </p>
            ) : submissions.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft)] px-4 py-4 text-sm text-[var(--muted)]">
                No submissions captured yet. New consultation requests will appear here after users submit the booking form.
              </p>
            ) : (
              <div className="mt-5 grid gap-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-950">{submission.name}</p>
                        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{submission.consultationType}</p>
                      </div>
                      <p className="text-xs text-[var(--muted)]">{formatSubmittedDate(submission.submittedAt)}</p>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-neutral-700 sm:grid-cols-2">
                      <p>Email: {submission.email}</p>
                      <p>Phone: {submission.phone}</p>
                      <p>Date: {submission.date || "Not provided"}</p>
                      <p>Time: {submission.time || "Not provided"}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{submission.request}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusButton label="new" isActive={submission.status === "new"} onClick={() => setStatus(submission.id, "new")} />
                      <StatusButton label="in-progress" isActive={submission.status === "in-progress"} onClick={() => setStatus(submission.id, "in-progress")} />
                      <StatusButton label="confirmed" isActive={submission.status === "confirmed"} onClick={() => setStatus(submission.id, "confirmed")} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-[28px] border border-[var(--line)] bg-white p-6 sm:p-7" data-scroll-reveal data-scroll-direction="right">
            <h2 className="text-3xl tracking-[-0.04em] text-neutral-950">Product inventory</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Current catalog data grouped by collection for quick admin checks.</p>
            <div className="mt-5 grid gap-3">
              {Object.entries(productByCollection).map(([collectionName, count]) => (
                <div key={collectionName} className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm">
                  <p className="text-neutral-700">{collectionName}</p>
                  <p className="font-semibold text-neutral-950">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 text-sm text-neutral-700">
              <p>Total products: <b>{products.length}</b></p>
              <p className="mt-1">Featured products: <b>{products.filter((product) => product.featured).length}</b></p>
            </div>
            <Link href="/catalog" className="mt-5 inline-flex rounded-full border border-black bg-black px-4 py-2.5 text-sm text-white transition hover:-translate-y-0.5">
              Open product catalog
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
