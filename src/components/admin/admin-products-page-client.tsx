"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminProduct } from "@/lib/admin/products";

const emptyProduct: AdminProduct = {
  slug: "",
  name: "",
  code: "",
  category: "Bridal",
  collection: "Wedding Dresses",
  tagline: "",
  description: "",
  priceFrom: "$0",
  leadTime: "4 to 6 weeks",
  appointmentType: "Private consultation",
  image: "",
  palette: "linear-gradient(135deg, #f7efe7 0%, #ffffff 100%)",
  materials: [],
  madeFor: [],
  highlights: [],
  featured: false,
  archived: false,
};

export function AdminProductsPageClient() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<AdminProduct>(emptyProduct);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    const response = await fetch("/api/admin/products", { method: "GET", cache: "no-store" });
    const payload = (await response.json()) as { message?: string; products?: AdminProduct[] };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to load products.");
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const nextProducts = payload.products ?? [];
    setProducts(nextProducts);
    setErrorMessage("");
    if (nextProducts.length > 0 && !nextProducts.some((item) => item.slug === selectedSlug)) {
      setSelectedSlug(nextProducts[0].slug);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.slug === selectedSlug) ?? null;
  }, [products, selectedSlug]);

  useEffect(() => {
    if (selectedProduct) {
      setDraft(selectedProduct);
    }
  }, [selectedProduct]);

  const updateArrayField = (field: "materials" | "madeFor" | "highlights", value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: value.split("\n").map((item) => item.trim()).filter(Boolean),
    }));
  };

  const saveProduct = async () => {
    setIsSaving(true);
    const response = await fetch("/api/admin/products", {
      method: selectedProduct ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to save product.");
      setIsSaving(false);
      return;
    }

    setErrorMessage("");
    setIsSaving(false);
    setIsCreating(false);
    await loadProducts();
    setSelectedSlug(draft.slug);
  };

  const startCreating = () => {
    setIsCreating(true);
    setSelectedSlug("");
    setDraft(emptyProduct);
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Products</p>
            <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">Product catalog management</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Manage couture product records, descriptions, pricing copy, media links, and merchandising flags.
            </p>
          </div>
          <button type="button" onClick={startCreating} className="rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white">
            Add product
          </button>
        </div>
      </header>

      {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  <th className="px-2 py-3">Product</th>
                  <th className="px-2 py-3">Collection</th>
                  <th className="px-2 py-3">Price</th>
                  <th className="px-2 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-2 py-6 text-sm text-[var(--muted)]">Loading products...</td></tr>
                ) : products.map((product) => (
                  <tr key={product.slug} className={`cursor-pointer border-b border-[var(--line)] transition hover:bg-[var(--soft)] ${selectedSlug === product.slug ? "bg-[var(--soft)]" : ""}`} onClick={() => { setIsCreating(false); setSelectedSlug(product.slug); }}>
                    <td className="px-2 py-3">
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-600">{product.slug}</p>
                    </td>
                    <td className="px-2 py-3 text-neutral-700">{product.collection}</td>
                    <td className="px-2 py-3 text-neutral-900">{product.priceFrom}</td>
                    <td className="px-2 py-3 text-neutral-700">{product.featured ? "Featured" : "Standard"}{product.archived ? " · Archived" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Slug<input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Code<input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            </div>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Name<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Category<input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Collection<input value={draft.collection} onChange={(event) => setDraft((current) => ({ ...current, collection: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            </div>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Tagline<input value={draft.tagline} onChange={(event) => setDraft((current) => ({ ...current, tagline: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Description<textarea rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Price From<input value={draft.priceFrom} onChange={(event) => setDraft((current) => ({ ...current, priceFrom: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Lead Time<input value={draft.leadTime} onChange={(event) => setDraft((current) => ({ ...current, leadTime: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            </div>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Appointment Type<input value={draft.appointmentType} onChange={(event) => setDraft((current) => ({ ...current, appointmentType: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Image URL<input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Palette<input value={draft.palette} onChange={(event) => setDraft((current) => ({ ...current, palette: event.target.value }))} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Materials<textarea rows={3} value={draft.materials.join("\n")} onChange={(event) => updateArrayField("materials", event.target.value)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Made For<textarea rows={3} value={draft.madeFor.join("\n")} onChange={(event) => updateArrayField("madeFor", event.target.value)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">Highlights<textarea rows={3} value={draft.highlights.join("\n")} onChange={(event) => updateArrayField("highlights", event.target.value)} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-900" /></label>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-800">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.archived} onChange={(event) => setDraft((current) => ({ ...current, archived: event.target.checked }))} /> Archived</label>
            </div>
            <button type="button" onClick={() => { void saveProduct(); }} disabled={isSaving} className="w-fit rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300">
              {isSaving ? "Saving..." : selectedProduct && !isCreating ? "Save Product" : "Create Product"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
