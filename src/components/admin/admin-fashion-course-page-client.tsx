"use client";

import { useEffect, useMemo, useState } from "react";

type FashionCourseRegistration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  experienceLevel: string;
  interestReason: string;
  preferredContactMethod: string;
  cohortLabel: string;
  registrationDeadline: string;
  courseStartDate: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  wantsMaterialsKit: boolean;
  paymentAmountCents: number;
  assessmentAnswers: Record<string, string>;
  assessmentScore: number;
  createdAt: string;
};

type RecoveryMetrics = {
  recoveryLimiter: {
    rowCount: number;
    oldestUpdatedAt: string | null;
  };
  maintenanceRun: {
    lastRunAt: string;
    lastStatus: "success" | "error";
    lastDeletedRows: number;
    lastRetentionDays: number;
    lastMessage: string;
  } | null;
};

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
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

export function AdminFashionCoursePageClient() {
  const [registrations, setRegistrations] = useState<FashionCourseRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "8plus" | "6to7" | "below6">("all");
  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetrics | null>(null);
  const [metricsError, setMetricsError] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resettingRegistrationId, setResettingRegistrationId] = useState("");

  const buildRetestEmail = (registration: FashionCourseRegistration) => {
    const subject = "OW Couture Academy Retest Instructions";
    const cohortText = registration.cohortLabel || "Current cohort";
    const deadlineText = formatDate(registration.registrationDeadline);
    const body = [
      `Hi ${registration.fullName},`,
      "",
      "You have been approved to retake the OW Couture Academy basic skills assessment.",
      `Cohort: ${cohortText}`,
      `Assessment deadline: ${deadlineText}`,
      "",
      "Please use this link to access your assessment:",
      "https://owcouture.ca/fashion-course/assessment",
      "",
      "Welcome to the Ow Couture Academy.",
      "",
      "Best regards,",
      "OW Couture Academy Team",
    ].join("\n");

    return `mailto:${encodeURIComponent(registration.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const loadRegistrations = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/fashion-course", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      message?: string;
      registrations?: Array<{
        id: string;
        full_name: string;
        email: string;
        phone: string;
        experience_level: string;
        interest_reason: string;
        preferred_contact_method: string;
        cohort_label: string;
        registration_deadline: string;
        course_start_date: string;
        status: "new" | "contacted" | "enrolled" | "closed";
        wants_materials_kit: boolean;
        payment_amount_cents: number;
        assessment_answers: Record<string, string> | null;
        assessment_score: number | null;
        created_at: string;
      }>;
    };

    if (!response.ok) {
      setRegistrations([]);
      setErrorMessage(payload.message ?? "Unable to load fashion course applicants.");
      setIsLoading(false);
      return;
    }

    const mapped = (payload.registrations ?? []).map((row) => {
      return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        experienceLevel: row.experience_level,
        interestReason: row.interest_reason,
        preferredContactMethod: row.preferred_contact_method,
        cohortLabel: row.cohort_label,
        registrationDeadline: row.registration_deadline,
        courseStartDate: row.course_start_date,
        status: row.status,
        wantsMaterialsKit: row.wants_materials_kit,
        paymentAmountCents: row.payment_amount_cents,
        assessmentAnswers: row.assessment_answers ?? {},
        assessmentScore: row.assessment_score ?? 0,
        createdAt: row.created_at,
      } satisfies FashionCourseRegistration;
    });

    setRegistrations(mapped);
    setIsLoading(false);
  };

  const loadRecoveryMetrics = async () => {
    setMetricsError("");

    const response = await fetch("/api/admin/recovery-metrics", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      message?: string;
      recoveryLimiter?: RecoveryMetrics["recoveryLimiter"];
      maintenanceRun?: RecoveryMetrics["maintenanceRun"];
    };

    if (!response.ok || !payload.recoveryLimiter) {
      setRecoveryMetrics(null);
      setMetricsError(payload.message ?? "Unable to load recovery diagnostics.");
      return;
    }

    setRecoveryMetrics({
      recoveryLimiter: payload.recoveryLimiter,
      maintenanceRun: payload.maintenanceRun ?? null,
    });
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadRegistrations(), loadRecoveryMetrics()]);
    setLastRefreshedAt(new Date().toISOString());
    setIsRefreshing(false);
  };

  const makeRetest = async (registration: FashionCourseRegistration) => {
    const confirmed = window.confirm(`Reset assessment for ${registration.fullName}? This will let them retake the test.`);
    if (!confirmed) {
      return false;
    }

    setResettingRegistrationId(registration.id);

    const response = await fetch("/api/admin/fashion-course", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: registration.id }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to reset assessment.");
      setResettingRegistrationId("");
      return false;
    }

    await refreshAll();
    setResettingRegistrationId("");
    return true;
  };

  const makeRetestAndEmail = async (registration: FashionCourseRegistration) => {
    const resetSucceeded = await makeRetest(registration);

    if (!resetSucceeded) {
      return;
    }

    // Open the local mail client with a prefilled draft after reset.
    window.open(buildRetestEmail(registration), "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    void refreshAll();

    const interval = window.setInterval(() => {
      void refreshAll();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const summary = useMemo(() => {
    const total = registrations.length;
    const avgScore =
      total === 0
        ? 0
        : registrations.reduce((sum, registration) => sum + registration.assessmentScore, 0) / total;

    return {
      total,
      topTier: registrations.filter((registration) => registration.assessmentScore >= 8).length,
      midTier: registrations.filter((registration) => registration.assessmentScore >= 6 && registration.assessmentScore <= 7).length,
      needsSupport: registrations.filter((registration) => registration.assessmentScore < 6).length,
      avgScore,
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return registrations.filter((registration) => {
      const searchMatch =
        normalizedSearch.length === 0 ||
        registration.fullName.toLowerCase().includes(normalizedSearch) ||
        registration.email.toLowerCase().includes(normalizedSearch) ||
        registration.experienceLevel.toLowerCase().includes(normalizedSearch);

      const scoreMatch =
        scoreFilter === "all" ||
        (scoreFilter === "8plus" && registration.assessmentScore >= 8) ||
        (scoreFilter === "6to7" && registration.assessmentScore >= 6 && registration.assessmentScore <= 7) ||
        (scoreFilter === "below6" && registration.assessmentScore < 6);

      return searchMatch && scoreMatch;
    });
  }, [registrations, searchTerm, scoreFilter]);

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Admin</p>
            <h1 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">
              Fashion course applicants.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Review registrations and quickly filter by assessment score to shortlist students.
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-[24px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Recovery Diagnostics</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {lastRefreshedAt ? `Last refreshed ${formatDate(lastRefreshedAt)}` : "Refreshing automatically every 15 seconds."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={isRefreshing}
              className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>
          {metricsError ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{metricsError}</p>
          ) : recoveryMetrics ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Limiter rows</p>
                <p className="mt-2 text-2xl tracking-[-0.03em] text-neutral-950">{recoveryMetrics.recoveryLimiter.rowCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Oldest activity</p>
                <p className="mt-2 text-sm text-neutral-900">
                  {recoveryMetrics.recoveryLimiter.oldestUpdatedAt ? formatDate(recoveryMetrics.recoveryLimiter.oldestUpdatedAt) : "None"}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Last cleanup</p>
                <p className="mt-2 text-sm text-neutral-900">
                  {recoveryMetrics.maintenanceRun ? `${formatDate(recoveryMetrics.maintenanceRun.lastRunAt)} · ${recoveryMetrics.maintenanceRun.lastStatus}` : "Not run yet"}
                </p>
                {recoveryMetrics.maintenanceRun ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Deleted {recoveryMetrics.maintenanceRun.lastDeletedRows} rows, retention {recoveryMetrics.maintenanceRun.lastRetentionDays} days.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">Loading recovery diagnostics...</p>
          )}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Applicants</p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-neutral-950">{summary.total}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Score 8-10</p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-neutral-950">{summary.topTier}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Score 6-7</p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-neutral-950">{summary.midTier}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Score below 6</p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-neutral-950">{summary.needsSupport}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Average score</p>
            <p className="mt-2 text-3xl tracking-[-0.03em] text-neutral-950">{summary.avgScore.toFixed(1)} / 10</p>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)] sm:col-span-2">
              Search
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, or level"
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              />
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Score filter
              <select
                value={scoreFilter}
                onChange={(event) => setScoreFilter(event.target.value as "all" | "8plus" | "6to7" | "below6")}
                className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              >
                <option value="all">All scores</option>
                <option value="8plus">8 to 10</option>
                <option value="6to7">6 to 7</option>
                <option value="below6">Below 6</option>
              </select>
            </label>
          </div>

          {errorMessage ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

          {isLoading ? (
            <p className="mt-5 text-sm text-[var(--muted)]">Loading applicants...</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {filteredRegistrations.length === 0 ? (
                <p className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-[var(--muted)]">
                  No applicants match this filter.
                </p>
              ) : (
                filteredRegistrations.map((registration) => (
                  <article key={registration.id} className="rounded-2xl border border-[var(--line)] bg-[rgba(250,250,250,0.6)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-neutral-950">{registration.fullName}</p>
                        <p className="text-sm text-[var(--muted)]">{registration.email}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{registration.phone}</p>
                      </div>
                      <div className="rounded-full border border-black px-3 py-1 text-xs font-medium text-neutral-900">
                        Score: {registration.assessmentScore} / 10
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
                      <p><b>Level:</b> {registration.experienceLevel}</p>
                      <p><b>Contact:</b> {registration.preferredContactMethod}</p>
                      <p><b>Cohort:</b> {registration.cohortLabel}</p>
                      <p><b>Submitted:</b> {formatDate(registration.createdAt)}</p>
                      <p><b>Materials Pack:</b> {registration.wantsMaterialsKit ? "Yes" : "No"}</p>
                      <p><b>Paid:</b> {formatCad(registration.paymentAmountCents)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          void makeRetest(registration);
                        }}
                        disabled={resettingRegistrationId === registration.id}
                        className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {resettingRegistrationId === registration.id ? "Resetting..." : "Make retest"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void makeRetestAndEmail(registration);
                        }}
                        disabled={resettingRegistrationId === registration.id}
                        className="rounded-full border border-black bg-black px-4 py-2 text-xs uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                      >
                        {resettingRegistrationId === registration.id ? "Resetting..." : "Make retest and email"}
                      </button>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-neutral-700">{registration.interestReason}</p>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
