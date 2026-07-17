"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/lib/admin/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [allowedSections, setAllowedSections] = useState<Array<string>>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAccess = async () => {
      const response = await fetch("/api/admin/access", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as { allowedSections?: string[] };
      if (!isMounted) {
        return;
      }

      setAllowedSections(payload.allowedSections ?? []);
    };

    void loadAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleNavItems = useMemo(() => {
    if (allowedSections.length === 0) {
      return adminNavItems;
    }

    return adminNavItems.filter((item) => allowedSections.includes(item.section));
  }, [allowedSections]);

  return (
    <main className="border-b border-[var(--line)] bg-[var(--soft)] py-10 sm:py-12">
      <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[28px] border border-[var(--line)] bg-white p-5 lg:sticky lg:top-[112px] lg:h-[calc(100vh-140px)] lg:overflow-y-auto">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">OW Couture</p>
          <h1 className="mt-2 text-2xl tracking-[-0.04em] text-neutral-950">Admin</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Business management system for couture operations.</p>

          <nav className="mt-5 grid gap-1">
            {visibleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl border px-3 py-2.5 transition ${
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-transparent text-neutral-700 hover:border-[var(--line)] hover:bg-[var(--soft)]"
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`text-xs ${isActive ? "text-white/85" : "text-[var(--muted)]"}`}>{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}
