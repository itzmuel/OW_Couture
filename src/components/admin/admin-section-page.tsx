import Link from "next/link";

import { type AdminSectionSlug } from "@/lib/admin/navigation";

type SectionContent = {
  title: string;
  description: string;
  modules: string[];
  primaryActionLabel: string;
};

const sectionContent: Record<Exclude<AdminSectionSlug, "consultations">, SectionContent> = {
  orders: {
    title: "Orders",
    description: "Track approval, payment, production stage, shipping, and delivery for every made-to-order purchase.",
    modules: ["Order queue", "Payment state", "Production timeline", "Customer notes", "Shipping tracker"],
    primaryActionLabel: "Create order workflow",
  },
  production: {
    title: "Production Tracker",
    description: "Move each order from measurements to packaging with real-time stage visibility for internal teams and clients.",
    modules: ["Stage board", "Tailor assignments", "Quality checks", "Delays and blockers", "Completion timestamps"],
    primaryActionLabel: "Set production stages",
  },
  products: {
    title: "Product Manager",
    description: "Manage couture items, pricing, production time, media, and SEO metadata from one place.",
    modules: ["Product catalog", "Media uploads", "Options and variants", "SEO fields", "Archive controls"],
    primaryActionLabel: "Add a product",
  },
  collections: {
    title: "Collections",
    description: "Organize wedding, RTW, evening, and seasonal collections with publishing and archive controls.",
    modules: ["Collection list", "Sort and feature", "Season tags", "Archive actions", "Homepage linking"],
    primaryActionLabel: "Create collection",
  },
  customers: {
    title: "Customers",
    description: "View customer profiles, order history, consultations, measurements, and lifetime spend.",
    modules: ["Customer records", "VIP segmentation", "Order history", "Consultation history", "Value insights"],
    primaryActionLabel: "Add customer note",
  },
  measurements: {
    title: "Measurements",
    description: "Store detailed body measurements with version history for repeat fittings and accuracy over time.",
    modules: ["Measurement forms", "Version snapshots", "Change comparison", "Profile linking", "Fitting notes"],
    primaryActionLabel: "Create measurement template",
  },
  payments: {
    title: "Payments",
    description: "Monitor payment lifecycle and refund status across all orders and consultations.",
    modules: ["Paid/pending/refunded", "Transaction details", "Refund controls", "Failed payment alerts", "Reconciliation"],
    primaryActionLabel: "Configure payment statuses",
  },
  shipping: {
    title: "Shipping",
    description: "Configure shipping zones, rates, delivery windows, and order dispatch states.",
    modules: ["Zone rules", "Rate cards", "Delivery SLAs", "Carrier notes", "Dispatch updates"],
    primaryActionLabel: "Add shipping rule",
  },
  inventory: {
    title: "Inventory",
    description: "Track consumables and production materials such as fabric, lace, zippers, and packaging.",
    modules: ["Material list", "Stock alerts", "Supplier records", "Usage history", "Reorder planning"],
    primaryActionLabel: "Add inventory item",
  },
  gallery: {
    title: "Gallery",
    description: "Curate before/after visuals, campaigns, runway highlights, and social media assets.",
    modules: ["Media library", "Albums", "Feature controls", "Video uploads", "Publishing queue"],
    primaryActionLabel: "Upload media",
  },
  reviews: {
    title: "Testimonials",
    description: "Moderate customer reviews with approve, edit, hide, and feature workflows.",
    modules: ["Review queue", "Moderation states", "Featured list", "Content edits", "Visibility controls"],
    primaryActionLabel: "Moderate testimonials",
  },
  marketing: {
    title: "Marketing",
    description: "Manage discounts, email flows, and campaign communication touchpoints.",
    modules: ["Discount codes", "Email templates", "Campaign windows", "Usage limits", "Audience targeting"],
    primaryActionLabel: "Create campaign",
  },
  website: {
    title: "Website CMS",
    description: "Edit homepage sections, about content, gallery, FAQs, and policy pages without a developer.",
    modules: ["Homepage editor", "Section content", "FAQ manager", "Policy pages", "Media bindings"],
    primaryActionLabel: "Edit website content",
  },
  analytics: {
    title: "Analytics",
    description: "Measure revenue, order volume, conversion, consultations, and customer retention trends.",
    modules: ["Revenue charts", "Order metrics", "Traffic and conversion", "AOV tracking", "Customer cohorts"],
    primaryActionLabel: "Configure analytics board",
  },
  team: {
    title: "Team Management",
    description: "Assign role-based access for Admin, Manager, Tailor, and Customer Service workflows.",
    modules: ["Role definitions", "Permission matrix", "Team members", "Audit events", "Access overrides"],
    primaryActionLabel: "Add team member",
  },
  settings: {
    title: "Settings",
    description: "Control global business rules, notifications, integrations, and operational defaults.",
    modules: ["Business profile", "Notification settings", "Integrations", "Environment checks", "Admin preferences"],
    primaryActionLabel: "Open settings",
  },
};

export function AdminSectionPage({ section }: { section: Exclude<AdminSectionSlug, "consultations"> }) {
  const content = sectionContent[section];

  return (
    <div className="grid gap-6">
      <header className="rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Admin Module</p>
        <h2 className="mt-2 text-[clamp(30px,4vw,48px)] leading-[1] tracking-[-0.05em] text-neutral-950">{content.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">{content.description}</p>
        <button type="button" className="mt-5 rounded-full border border-black bg-black px-5 py-2.5 text-sm text-white">
          {content.primaryActionLabel}
        </button>
      </header>

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 sm:p-6">
        <h3 className="text-xl tracking-[-0.03em] text-neutral-950">Planned capabilities</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {content.modules.map((item) => (
            <div key={item} className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm text-neutral-800">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)] sm:p-6">
        This module is scaffolded and ready for data wiring. For live operational data, start with
        <span> </span>
        <Link href="/admin/consultations" className="text-black underline">
          Consultations
        </Link>
        <span> </span>
        and then expand Orders and Production workflows.
      </section>
    </div>
  );
}
