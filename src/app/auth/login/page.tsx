"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { logIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <main className="border-b border-[var(--line)] py-16 sm:py-20">
      <section className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,64px)] leading-[1] tracking-[-0.055em] text-neutral-950">Welcome back.</h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">
          Log in to access your account details.
        </p>

        <form
          className="mt-8 grid gap-4 rounded-[30px] border border-[var(--line)] bg-[rgba(250,250,250,0.7)] p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const response = await logIn(
              String(formData.get("email") ?? ""),
              String(formData.get("password") ?? ""),
            );

            if (!response.ok) {
              setErrorMessage(response.message);
              return;
            }

            const adminAccessResponse = await fetch("/api/admin/access", {
              method: "GET",
              cache: "no-store",
            });
            const adminAccessPayload = (await adminAccessResponse.json()) as { isAdmin?: boolean };

            setErrorMessage("");
            router.push(adminAccessPayload.isAdmin ? "/admin" : "/account");
          }}
        >
          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              placeholder="name@example.com"
            />
          </label>

          <label className="grid gap-2 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-black"
              placeholder="Your password"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
          ) : null}

          <button type="submit" className="mt-2 rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-900">
            Log in
          </button>

          <p className="text-sm text-[var(--muted)]">
            New here? <Link href="/auth/signup" className="text-black underline">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
