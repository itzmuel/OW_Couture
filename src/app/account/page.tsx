"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth-context";

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
  const { currentUser } = useAuth();

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Your profile.</h1>

        {currentUser ? (
          <div className="mt-8 grid gap-6 rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6 sm:p-8">
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
