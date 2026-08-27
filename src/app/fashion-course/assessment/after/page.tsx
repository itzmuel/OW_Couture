import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment Complete | OW Couture Academy",
  description: "Assessment completion page for OW Couture Academy.",
};

function getScoreValue(scoreParam?: string) {
  const score = Number.parseInt(scoreParam ?? "", 10);
  if (!Number.isFinite(score) || score < 0) {
    return 0;
  }

  return Math.min(10, score);
}

export default function FashionCourseAssessmentAfterPage({
  searchParams,
}: {
  searchParams?: { score?: string };
}) {
  const score = getScoreValue(searchParams?.score);

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,0.05)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">OW Couture Academy</p>
          <h1 className="mt-3 text-[clamp(34px,5vw,58px)] leading-[1.02] tracking-[-0.055em] text-neutral-950">
            Welcome to the Ow Couture Academy.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">
            Your assessment has been submitted successfully. You scored <b>{score}</b>/10.
          </p>
          <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">
            You will receive an email shortly with further instructions for the course.
          </p>

          <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[var(--soft)] p-5 text-sm leading-7 text-neutral-800 sm:p-6">
            Please keep an eye on your inbox, including your spam or promotions folder, for the next steps.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5">
              Return home
            </Link>
            <Link href="/fashion-course" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:border-black">
              Back to Fashion Course
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}