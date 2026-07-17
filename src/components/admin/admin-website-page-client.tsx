"use client";

import { useEffect, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import { defaultHomepageContent, type HomepageContent } from "@/lib/admin/website";

export function AdminWebsitePageClient() {
  const { hasPermission } = useAdminAccess();
  const [homepage, setHomepage] = useState<HomepageContent>(defaultHomepageContent);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setIsLoading(true);
      const response = await fetch("/api/admin/site-content", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as { message?: string; homepage?: HomepageContent };
      if (!isMounted) {
        return;
      }

      if (!response.ok || !payload.homepage) {
        setErrorMessage(payload.message ?? "Unable to load website content.");
        setIsLoading(false);
        return;
      }

      setHomepage(payload.homepage);
      setErrorMessage("");
      setIsLoading(false);
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveContent = async () => {
    if (!hasPermission("website:manage")) {
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/admin/site-content", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ homepage }),
    });

    const payload = (await response.json()) as { message?: string; homepage?: HomepageContent };
    if (!response.ok || !payload.homepage) {
      setErrorMessage(payload.message ?? "Unable to save website content.");
      setIsSaving(false);
      return;
    }

    setHomepage(payload.homepage);
    setErrorMessage("");
    setIsSaving(false);
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Website CMS</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Homepage content editor</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Update hero copy, about text, testimonial copy, and contact text without editing source files.
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-[var(--muted)]">Loading website content...</p>
        ) : (
          <div className="grid gap-4">
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Hero Title
              <input value={homepage.heroTitle} onChange={(event) => setHomepage((current) => ({ ...current, heroTitle: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Hero Subtitle
              <input value={homepage.heroSubtitle} onChange={(event) => setHomepage((current) => ({ ...current, heroSubtitle: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              About Title
              <input value={homepage.aboutTitle} onChange={(event) => setHomepage((current) => ({ ...current, aboutTitle: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              About Body
              <textarea rows={4} value={homepage.aboutBody} onChange={(event) => setHomepage((current) => ({ ...current, aboutBody: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Testimonial Title
              <input value={homepage.testimonialTitle} onChange={(event) => setHomepage((current) => ({ ...current, testimonialTitle: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Testimonial Body
              <textarea rows={3} value={homepage.testimonialBody} onChange={(event) => setHomepage((current) => ({ ...current, testimonialBody: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Contact Title
              <input value={homepage.contactTitle} onChange={(event) => setHomepage((current) => ({ ...current, contactTitle: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              Contact Body
              <textarea rows={4} value={homepage.contactBody} onChange={(event) => setHomepage((current) => ({ ...current, contactBody: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" />
            </label>
            <button type="button" onClick={() => { void saveContent(); }} disabled={isSaving || !hasPermission("website:manage")} className="w-fit rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300">
              {isSaving ? "Saving..." : hasPermission("website:manage") ? "Save Homepage Content" : "View only"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
