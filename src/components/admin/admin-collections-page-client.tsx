"use client";

import { useEffect, useMemo, useState } from "react";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import type { AdminCollection } from "@/lib/admin/collections";

export function AdminCollectionsPageClient() {
  const { hasPermission } = useAdminAccess();
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<AdminCollection["slug"] | "">("");
  const [draft, setDraft] = useState<AdminCollection | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadCollections = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/collections", { method: "GET", cache: "no-store" });
    const payload = (await response.json()) as { message?: string; collections?: AdminCollection[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load collections.");
      setCollections([]);
      setIsLoading(false);
      return;
    }

    const nextCollections = payload.collections ?? [];
    setCollections(nextCollections);
    setErrorMessage("");
    if (nextCollections.length > 0 && !nextCollections.some((item) => item.slug === selectedSlug)) {
      setSelectedSlug(nextCollections[0].slug);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const selectedCollection = useMemo(() => {
    return collections.find((collection) => collection.slug === selectedSlug) ?? null;
  }, [collections, selectedSlug]);

  useEffect(() => {
    if (selectedCollection) {
      setDraft(selectedCollection);
    }
  }, [selectedCollection]);

  const saveCollection = async () => {
    if (!hasPermission("collections:manage")) {
      return;
    }

    if (!draft) {
      return;
    }

    setIsSaving(true);
    const response = await fetch("/api/admin/collections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save collection.");
      setIsSaving(false);
      return;
    }

    setErrorMessage("");
    setIsSaving(false);
    await loadCollections();
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Collections</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Collection merchandising</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Update collection headlines, supporting copy, CTA messaging, sort order, and archive state without code edits.
        </p>
      </header>

      {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Collection</th>
                  <th className="px-2 py-3">Sort</th>
                  <th className="px-2 py-3">State</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="px-2 py-6 text-sm text-[var(--muted)]">Loading collections...</td></tr>
                ) : collections.map((collection) => (
                  <tr key={collection.slug} className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${selectedSlug === collection.slug ? "bg-[var(--soft)]" : ""}`} onClick={() => setSelectedSlug(collection.slug)}>
                    <td className="px-2 py-3">
                      <p className="font-medium text-neutral-900">{collection.label}</p>
                      <p className="text-xs text-neutral-600">{collection.slug}</p>
                    </td>
                    <td className="px-2 py-3 text-neutral-700">{collection.sortOrder}</td>
                    <td className="px-2 py-3 text-neutral-700">{collection.archived ? "Archived" : "Live"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          {draft ? (
            <div className="grid gap-3">
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Label<input value={draft.label} onChange={(event) => setDraft((current) => current ? { ...current, label: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Eyebrow<input value={draft.eyebrow} onChange={(event) => setDraft((current) => current ? { ...current, eyebrow: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Title<input value={draft.title} onChange={(event) => setDraft((current) => current ? { ...current, title: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Description<textarea rows={4} value={draft.description} onChange={(event) => setDraft((current) => current ? { ...current, description: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">CTA Eyebrow<input value={draft.ctaEyebrow} onChange={(event) => setDraft((current) => current ? { ...current, ctaEyebrow: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">CTA Title<input value={draft.ctaTitle} onChange={(event) => setDraft((current) => current ? { ...current, ctaTitle: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">CTA Body<textarea rows={3} value={draft.ctaBody} onChange={(event) => setDraft((current) => current ? { ...current, ctaBody: event.target.value } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Sort Order<input type="number" value={draft.sortOrder} onChange={(event) => setDraft((current) => current ? { ...current, sortOrder: Number(event.target.value) || 0 } : current)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
                <label className="flex items-center gap-2 pt-6 text-sm text-neutral-800"><input type="checkbox" checked={draft.archived} onChange={(event) => setDraft((current) => current ? { ...current, archived: event.target.checked } : current)} /> Archived</label>
              </div>
              <button type="button" onClick={() => { void saveCollection(); }} disabled={isSaving || !hasPermission("collections:manage")} className="w-fit rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300">
                {isSaving ? "Saving..." : hasPermission("collections:manage") ? "Save Collection" : "View only"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a collection to edit storefront copy.</p>
          )}
        </section>
      </div>
    </div>
  );
}
