"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAdminAccess } from "@/components/admin/use-admin-access";
import { defaultShippingPlanContent, type ShippingPlanContent, type ShippingPlanRow } from "@/lib/admin/website";
import type { AdminSectionSlug } from "@/lib/admin/navigation";

type OperationsSection = "shipping" | "inventory" | "gallery" | "reviews" | "marketing" | "settings";

type OrdersPayload = {
  orders: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    orderDate: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
    shippingAddress: string | null;
    items: Array<{
      id: string;
      productSlug: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
};

type ProductsPayload = {
  products: Array<{
    slug: string;
    name: string;
    collection: string;
    materials: string[];
    archived: boolean;
  }>;
};

type ConsultationsPayload = {
  submissions: Array<{
    id: string;
    name: string;
    email: string;
    consultation_type: string;
    request: string;
    status: "new" | "in-progress" | "confirmed";
    created_at: string;
  }>;
};

type CustomersPayload = {
  customers: Array<{
    email: string;
    name: string;
    orderCount: number;
  }>;
};

type MediaAsset = {
  path: string;
  url: string;
  name: string;
  createdAt?: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "N/A";
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

function formatCurrency(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

function StatCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string | number;
  detail?: string;
  tone?: "default" | "good" | "warning";
}) {
  const toneClass = tone === "good" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-neutral-950";

  return (
    <article className="group rounded-[24px] border border-[var(--line)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-3xl tracking-[-0.03em] ${toneClass}`}>{value}</p>
      {detail ? <p className="mt-2 text-xs text-[var(--muted)]">{detail}</p> : null}
    </article>
  );
}

function ProgressMeter({ label, value, max, hint }: { label: string; value: number; max: number; hint?: string }) {
  const safeMax = Math.max(max, 1);
  const percent = (value / safeMax) * 100;

  return (
    <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-800">{label}</p>
        <p className="text-sm font-medium text-neutral-950">{value}</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[var(--soft)]">
        <div className="h-full rounded-full bg-black transition-[width] duration-500" style={{ width: `${Math.max(6, Math.min(100, percent))}%` }} />
      </div>
      {hint ? <p className="mt-2 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

const sectionTitles: Record<OperationsSection, { title: string; subtitle: string }> = {
  shipping: {
    title: "Shipping Operations",
    subtitle: "Dispatch visibility, address readiness, and outbound volume.",
  },
  inventory: {
    title: "Inventory Intelligence",
    subtitle: "Track material demand and current catalog coverage.",
  },
  gallery: {
    title: "Gallery Library",
    subtitle: "Manage reusable campaign and product image assets.",
  },
  reviews: {
    title: "Reviews Workflow",
    subtitle: "Turn consultation feedback into curated testimonials.",
  },
  marketing: {
    title: "Marketing Command",
    subtitle: "Monitor pipeline conversion and campaign opportunities.",
  },
  settings: {
    title: "Operational Settings",
    subtitle: "Audit access, section visibility, and admin readiness.",
  },
};

export function AdminOperationsPageClient({ section }: { section: Extract<AdminSectionSlug, OperationsSection> }) {
  const { hasPermission } = useAdminAccess();
  const [orders, setOrders] = useState<OrdersPayload["orders"]>([]);
  const [products, setProducts] = useState<ProductsPayload["products"]>([]);
  const [consultations, setConsultations] = useState<ConsultationsPayload["submissions"]>([]);
  const [customers, setCustomers] = useState<CustomersPayload["customers"]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [shippingPlan, setShippingPlan] = useState<ShippingPlanContent>(defaultShippingPlanContent);
  const [allowedSections, setAllowedSections] = useState<string[]>([]);
  const [adminRole, setAdminRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingShippingPlan, setIsSavingShippingPlan] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSectionData = async () => {
    setIsLoading(true);
    setErrorMessage("");

    if (section === "shipping") {
      const [ordersResponse, shippingPlanResponse] = await Promise.all([
        fetch("/api/admin/orders", { method: "GET", cache: "no-store" }),
        fetch("/api/admin/shipping-plan", { method: "GET", cache: "no-store" }),
      ]);

      const ordersPayload = (await ordersResponse.json()) as { message?: string } & OrdersPayload;
      const shippingPlanPayload = (await shippingPlanResponse.json()) as { message?: string; shippingPlan?: ShippingPlanContent };

      if (!ordersResponse.ok || !shippingPlanResponse.ok) {
        setErrorMessage(ordersPayload.message ?? shippingPlanPayload.message ?? "Unable to load shipping data.");
        setOrders([]);
        setShippingPlan(defaultShippingPlanContent);
        setIsLoading(false);
        return;
      }

      setOrders(ordersPayload.orders ?? []);
      setShippingPlan(shippingPlanPayload.shippingPlan ?? defaultShippingPlanContent);
      setIsLoading(false);
      return;
    }

    if (section === "inventory") {
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/orders", { method: "GET", cache: "no-store" }),
        fetch("/api/admin/products", { method: "GET", cache: "no-store" }),
      ]);

      const ordersPayload = (await ordersResponse.json()) as { message?: string } & OrdersPayload;
      const productsPayload = (await productsResponse.json()) as { message?: string } & ProductsPayload;

      if (!ordersResponse.ok) {
        setErrorMessage(ordersPayload.message ?? "Unable to load order demand.");
        setOrders([]);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      if (!productsResponse.ok) {
        setErrorMessage(productsPayload.message ?? "Unable to load products for inventory analysis.");
        setOrders([]);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setOrders(ordersPayload.orders ?? []);
      setProducts(productsPayload.products ?? []);
      setIsLoading(false);
      return;
    }

    if (section === "gallery") {
      const response = await fetch("/api/admin/media", { method: "GET", cache: "no-store" });
      const payload = (await response.json()) as { message?: string; assets?: MediaAsset[] };
      if (!response.ok) {
        setErrorMessage(payload.message ?? "Unable to load gallery assets.");
        setMediaAssets([]);
        setIsLoading(false);
        return;
      }

      setMediaAssets(payload.assets ?? []);
      setIsLoading(false);
      return;
    }

    if (section === "reviews") {
      const response = await fetch("/api/admin/consultations", { method: "GET", cache: "no-store" });
      const payload = (await response.json()) as { message?: string } & ConsultationsPayload;
      if (!response.ok) {
        setErrorMessage(payload.message ?? "Unable to load review candidates.");
        setConsultations([]);
        setIsLoading(false);
        return;
      }

      setConsultations(payload.submissions ?? []);
      setIsLoading(false);
      return;
    }

    if (section === "marketing") {
      const [ordersResponse, consultationsResponse, customersResponse] = await Promise.all([
        fetch("/api/admin/orders", { method: "GET", cache: "no-store" }),
        fetch("/api/admin/consultations", { method: "GET", cache: "no-store" }),
        fetch("/api/admin/customers", { method: "GET", cache: "no-store" }),
      ]);

      const ordersPayload = (await ordersResponse.json()) as { message?: string } & OrdersPayload;
      const consultationsPayload = (await consultationsResponse.json()) as { message?: string } & ConsultationsPayload;
      const customersPayload = (await customersResponse.json()) as { message?: string } & CustomersPayload;

      if (!ordersResponse.ok || !consultationsResponse.ok || !customersResponse.ok) {
        setErrorMessage(ordersPayload.message ?? consultationsPayload.message ?? customersPayload.message ?? "Unable to load marketing analytics.");
        setOrders([]);
        setConsultations([]);
        setCustomers([]);
        setIsLoading(false);
        return;
      }

      setOrders(ordersPayload.orders ?? []);
      setConsultations(consultationsPayload.submissions ?? []);
      setCustomers(customersPayload.customers ?? []);
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/admin/access", { method: "GET", cache: "no-store" });
    const payload = (await response.json()) as {
      message?: string;
      isAdmin?: boolean;
      allowedSections?: string[];
      permissions?: string[];
      role?: string;
    };

    if (!response.ok || !payload.isAdmin) {
      setErrorMessage(payload.message ?? "Unable to load settings diagnostics.");
      setAllowedSections([]);
      setPermissions([]);
      setAdminRole("");
      setIsLoading(false);
      return;
    }

    setAllowedSections(payload.allowedSections ?? []);
    setPermissions(payload.permissions ?? []);
    setAdminRole(payload.role ?? "");
    setIsLoading(false);
  };

  useEffect(() => {
    void loadSectionData();
  }, [section]);

  const shippingRows = useMemo(() => {
    return orders
      .filter((order) => order.status === "ready-to-ship" || order.status === "delivered")
      .sort((left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime())
      .slice(0, 20);
  }, [orders]);

  const shippingSummary = useMemo(() => {
    const ready = orders.filter((order) => order.status === "ready-to-ship").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const missingAddress = orders.filter((order) => !order.shippingAddress?.trim()).length;

    return { ready, delivered, missingAddress };
  }, [orders]);

  const shippingHealth = useMemo(() => {
    const trackedOrders = Math.max(orders.length, 1);
    const dispatchRate = ((shippingSummary.delivered + shippingSummary.ready) / trackedOrders) * 100;
    const addressCompleteness = ((trackedOrders - shippingSummary.missingAddress) / trackedOrders) * 100;

    return { dispatchRate, addressCompleteness };
  }, [orders.length, shippingSummary.delivered, shippingSummary.missingAddress, shippingSummary.ready]);

  const updateShippingPlanRow = (rowIndex: number, field: keyof ShippingPlanRow, value: string) => {
    setShippingPlan((current) => ({
      ...current,
      rows: current.rows.map((row, index) => (index === rowIndex ? { ...row, [field]: value } : row)),
    }));
  };

  const saveShippingPlan = async () => {
    if (!hasPermission("settings:manage")) {
      return;
    }

    setIsSavingShippingPlan(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/shipping-plan", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shippingPlan }),
    });

    const payload = (await response.json()) as { message?: string; shippingPlan?: ShippingPlanContent };
    if (!response.ok || !payload.shippingPlan) {
      setErrorMessage(payload.message ?? "Unable to save shipping plan.");
      setIsSavingShippingPlan(false);
      return;
    }

    setShippingPlan(payload.shippingPlan);
    setIsSavingShippingPlan(false);
  };

  const inventoryInsights = useMemo(() => {
    const materialCounts = new Map<string, number>();
    products
      .filter((product) => !product.archived)
      .forEach((product) => {
        product.materials.forEach((material) => {
          const key = material.trim();
          if (!key) {
            return;
          }

          materialCounts.set(key, (materialCounts.get(key) ?? 0) + 1);
        });
      });

    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
    const openUnits = activeOrders.reduce((sum, order) => {
      return sum + order.items.reduce((innerSum, item) => innerSum + item.quantity, 0);
    }, 0);

    const topMaterials = Array.from(materialCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([material, usageCount]) => ({ material, usageCount }));

    return {
      openUnits,
      activeOrders: activeOrders.length,
      activeProducts: products.filter((product) => !product.archived).length,
      topMaterials,
    };
  }, [orders, products]);

  const reviewsSummary = useMemo(() => {
    return {
      newCount: consultations.filter((item) => item.status === "new").length,
      inProgressCount: consultations.filter((item) => item.status === "in-progress").length,
      confirmedCount: consultations.filter((item) => item.status === "confirmed").length,
    };
  }, [consultations]);

  const marketingSummary = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;
    const revenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const consultationEmails = new Set(consultations.map((item) => item.email.toLowerCase()));
    const convertedEmails = customers
      .map((customer) => customer.email.toLowerCase())
      .filter((email) => consultationEmails.has(email));

    const conversionRate = consultationEmails.size > 0 ? (convertedEmails.length / consultationEmails.size) * 100 : 0;

    return {
      paidOrders,
      revenue,
      consultationCount: consultations.length,
      customerCount: customers.length,
      conversionRate,
    };
  }, [consultations, customers, orders]);

  const topConfirmedConsultations = useMemo(() => {
    return consultations
      .filter((item) => item.status === "confirmed")
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .slice(0, 12);
  }, [consultations]);

  const uploadToGallery = async (file: File) => {
    if (!hasPermission("website:manage")) {
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { message?: string; asset?: MediaAsset };
    if (!response.ok || !payload.asset) {
      setErrorMessage(payload.message ?? "Unable to upload asset.");
      setIsUploading(false);
      return;
    }

    setMediaAssets((current) => [payload.asset as MediaAsset, ...current]);
    setIsUploading(false);
    setErrorMessage("");
  };

  const removeAsset = async (path: string) => {
    if (!hasPermission("website:manage")) {
      return;
    }

    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setErrorMessage(payload.message ?? "Unable to remove asset.");
      return;
    }

    setMediaAssets((current) => current.filter((asset) => asset.path !== path));
    setErrorMessage("");
  };

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-gradient-to-br from-white via-white to-[var(--soft)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{section}</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">{sectionTitles[section].title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">{sectionTitles[section].subtitle}</p>
      </header>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)] sm:p-6">
          Loading {section} data...
        </section>
      ) : null}

      {!isLoading && section === "shipping" ? (
        <>
          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Shipping information plan</p>
                <h3 className="mt-2 text-xl tracking-[-0.03em] text-neutral-950">Editable rate card and delivery timeline</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-[var(--muted)]">Base 2kg rate plus additional 1kg pricing</p>
                <button
                  type="button"
                  onClick={() => {
                    void saveShippingPlan();
                  }}
                  disabled={isSavingShippingPlan || !hasPermission("settings:manage")}
                  className="rounded-full border border-black bg-black px-4 py-2 text-xs uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                >
                  {isSavingShippingPlan ? "Saving..." : hasPermission("settings:manage") ? "Save shipping plan" : "View only"}
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[1040px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    <th className="px-2 py-3">Country</th>
                    <th className="px-2 py-3">Province</th>
                    <th className="px-2 py-3">Region</th>
                    <th className="px-2 py-3">2kg</th>
                    <th className="px-2 py-3">Additional 1kg</th>
                    <th className="px-2 py-3">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingPlan.rows.map((row, index) => (
                    <tr key={`${row.country}-${row.province}-${row.region}-${index}`} className="border-b border-[var(--line)] align-top transition hover:bg-[var(--soft)]">
                      <td className="px-2 py-3">
                        <input
                          value={row.country}
                          onChange={(event) => updateShippingPlanRow(index, "country", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="Country"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={row.province}
                          onChange={(event) => updateShippingPlanRow(index, "province", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="Province"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={row.region}
                          onChange={(event) => updateShippingPlanRow(index, "region", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="Region"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={row.twoKg}
                          onChange={(event) => updateShippingPlanRow(index, "twoKg", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="59"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={row.additionalOneKg}
                          onChange={(event) => updateShippingPlanRow(index, "additionalOneKg", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="5.25"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          value={row.timeline}
                          onChange={(event) => updateShippingPlanRow(index, "timeline", event.target.value)}
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-neutral-900"
                          placeholder="up to 7 days"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Ready to ship" value={shippingSummary.ready} detail="Orders queued for dispatch" />
            <StatCard label="Delivered" value={shippingSummary.delivered} detail="Completed handoffs" tone="good" />
            <StatCard label="Missing address" value={shippingSummary.missingAddress} detail="Requires customer follow-up" tone="warning" />
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <ProgressMeter
              label="Dispatch throughput"
              value={Number(formatPercent(shippingHealth.dispatchRate).replace("%", ""))}
              max={100}
              hint="Based on delivered + ready-to-ship orders"
            />
            <ProgressMeter
              label="Address completeness"
              value={Number(formatPercent(shippingHealth.addressCompleteness).replace("%", ""))}
              max={100}
              hint="Orders with valid shipping addresses"
            />
          </section>

          <section className="min-w-0 rounded-[24px] border border-[var(--line)] bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-5">
            <div className="overflow-x-auto">
              <table className="min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    <th className="px-2 py-3">Order</th>
                    <th className="px-2 py-3">Customer</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Address</th>
                    <th className="px-2 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-[var(--muted)]">No outbound shipping records found yet.</td>
                    </tr>
                  ) : (
                    shippingRows.map((order) => (
                      <tr key={order.id} className="border-b border-[var(--line)] transition hover:bg-[var(--soft)]">
                        <td className="px-2 py-3 font-medium text-neutral-900">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-2 py-3 text-neutral-700">{order.customerName}</td>
                        <td className="px-2 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.08em] ${order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="max-w-[320px] px-2 py-3 text-neutral-700">{order.shippingAddress || "Missing address"}</td>
                        <td className="px-2 py-3 text-neutral-700">{formatDate(order.orderDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {!isLoading && section === "inventory" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Active products" value={inventoryInsights.activeProducts} detail="Currently published catalog items" />
            <StatCard label="Open orders" value={inventoryInsights.activeOrders} detail="Orders still in production pipeline" />
            <StatCard label="Units in production" value={inventoryInsights.openUnits} detail="Total quantity across active orders" />
          </section>

          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
            <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Top materials used in active catalog</h3>
            <div className="mt-4 grid gap-2">
              {inventoryInsights.topMaterials.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No material tags are currently set on products.</p>
              ) : (
                inventoryInsights.topMaterials.map((material, index) => (
                  <div key={material.material} className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm transition hover:border-black">
                    <p className="text-neutral-700">{material.material}</p>
                    <p className="font-medium text-neutral-950">#{index + 1} in {material.usageCount} products</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}

      {!isLoading && section === "gallery" ? (
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Assets here can be reused in Products and Website modules.</p>
            <label className="rounded-full border border-black bg-black px-4 py-2 text-xs uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:shadow-lg">
              {isUploading ? "Uploading..." : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading || !hasPermission("website:manage")}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  void uploadToGallery(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mediaAssets.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No gallery assets found yet.</p>
            ) : (
              mediaAssets.map((asset) => (
                <div key={asset.path} className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                  <img src={asset.url} alt={asset.name} className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  <div className="grid gap-2 p-3">
                    <p className="truncate text-xs text-neutral-700">{asset.name}</p>
                    <p className="text-xs text-[var(--muted)]">Added: {formatDate(asset.createdAt ?? null)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/admin/products" className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-neutral-800 hover:border-black">
                        Use in product
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void removeAsset(asset.path);
                        }}
                        disabled={!hasPermission("website:manage")}
                        className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}

      {!isLoading && section === "reviews" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="New requests" value={reviewsSummary.newCount} detail="Fresh consultation notes" tone="warning" />
            <StatCard label="In progress" value={reviewsSummary.inProgressCount} detail="Under concierge follow-up" />
            <StatCard label="Confirmed" value={reviewsSummary.confirmedCount} detail="Candidates for testimonials" tone="good" />
          </section>

          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Testimonial candidates</h3>
              <Link href="/admin/consultations" className="text-sm underline">
                Open consultations queue
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {topConfirmedConsultations.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No confirmed consultations are available to convert into reviews yet.</p>
              ) : (
                topConfirmedConsultations.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-[var(--line)] p-4 text-sm transition hover:border-black hover:bg-[var(--soft)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        <p className="text-xs text-[var(--muted)]">{formatDate(item.created_at)}</p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[var(--muted)]">{item.consultation_type}</p>
                      <p className="mt-2 leading-6 text-neutral-700">{item.request}</p>
                    </div>
                  ))
              )}
            </div>
          </section>
        </>
      ) : null}

      {!isLoading && section === "marketing" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Paid orders" value={marketingSummary.paidOrders} detail="Closed transactions" />
            <StatCard label="Revenue" value={formatCurrency(marketingSummary.revenue)} detail="Paid order total" tone="good" />
            <StatCard label="Consultations" value={marketingSummary.consultationCount} detail="Total leads captured" />
            <StatCard label="Consult to client rate" value={formatPercent(marketingSummary.conversionRate)} detail="Consultation conversion" />
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <ProgressMeter
              label="Consultation conversion"
              value={marketingSummary.conversionRate}
              max={100}
              hint="Share of consultation leads that became known customers"
            />
            <ProgressMeter
              label="Paid order mix"
              value={marketingSummary.paidOrders}
              max={Math.max(orders.length, 1)}
              hint="Paid orders out of total tracked orders"
            />
          </section>

          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
            <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Campaign opportunities</h3>
            <div className="mt-4 grid gap-3">
              <p className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-700 transition hover:border-black hover:bg-[var(--soft)]">
                Follow up with consultation leads that are still marked <b>new</b> after 3 days.
              </p>
              <p className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-700 transition hover:border-black hover:bg-[var(--soft)]">
                Promote top-selling dresses using assets from the Gallery section and link to Collections.
              </p>
              <p className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-700 transition hover:border-black hover:bg-[var(--soft)]">
                Prioritize campaigns around weeks where consultation volume peaks.
              </p>
            </div>
          </section>
        </>
      ) : null}

      {!isLoading && section === "settings" ? (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Admin role" value={adminRole || "Unknown"} detail="Current signed-in role" />
            <StatCard label="Permissions" value={permissions.length} detail="Granted capabilities" />
            <StatCard label="Accessible modules" value={allowedSections.length} detail="Visible admin sections" />
          </section>

          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.03)] sm:p-6">
            <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Current access profile</h3>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1">
              {permissions.map((permission) => (
                <p key={permission} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-neutral-700 transition hover:border-black hover:bg-[var(--soft)]">
                  {permission}
                </p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/admin/team" className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.08em] text-neutral-900 hover:bg-black hover:text-white">
                Open team permissions
              </Link>
              <Link href="/admin/website" className="rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.08em] text-neutral-900 hover:bg-black hover:text-white">
                Open website cms
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
