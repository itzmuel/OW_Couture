export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
  section: "dashboard" | AdminSectionSlug;
};

import type { AdminPermission } from "@/lib/admin/team";

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", description: "Business command center", section: "dashboard" },
  { label: "Orders", href: "/admin/orders", description: "Order intake and fulfillment", section: "orders" },
  { label: "Production", href: "/admin/production", description: "Made-to-order stage tracker", section: "production" },
  { label: "Products", href: "/admin/products", description: "Catalog, media, and SEO", section: "products" },
  { label: "Collections", href: "/admin/collections", description: "Wedding, RTW, Evening, Seasonal", section: "collections" },
  { label: "Customers", href: "/admin/customers", description: "Client profiles and lifetime value", section: "customers" },
  { label: "Consultations", href: "/admin/consultations", description: "Bookings and status management", section: "consultations" },
  { label: "Measurements", href: "/admin/measurements", description: "Body measurements and version history", section: "measurements" },
  { label: "Payments", href: "/admin/payments", description: "Paid, pending, refunded", section: "payments" },
  { label: "Shipping", href: "/admin/shipping", description: "Region rules and rates", section: "shipping" },
  { label: "Inventory", href: "/admin/inventory", description: "Fabric and packaging stock", section: "inventory" },
  { label: "Gallery", href: "/admin/gallery", description: "Campaign and lookbook media", section: "gallery" },
  { label: "Reviews", href: "/admin/reviews", description: "Testimonials moderation", section: "reviews" },
  { label: "Marketing", href: "/admin/marketing", description: "Discounts and email flows", section: "marketing" },
  { label: "Website", href: "/admin/website", description: "CMS for site content", section: "website" },
  { label: "Analytics", href: "/admin/analytics", description: "Revenue and conversion metrics", section: "analytics" },
  { label: "Team", href: "/admin/team", description: "Roles and permissions", section: "team" },
  { label: "Settings", href: "/admin/settings", description: "Operational configuration", section: "settings" },
];

export const adminSections = [
  "orders",
  "production",
  "products",
  "collections",
  "customers",
  "consultations",
  "measurements",
  "payments",
  "shipping",
  "inventory",
  "gallery",
  "reviews",
  "marketing",
  "website",
  "analytics",
  "team",
  "settings",
] as const;

export type AdminSectionSlug = (typeof adminSections)[number];

export const adminSectionPermissions: Record<"dashboard" | AdminSectionSlug, AdminPermission> = {
  dashboard: "dashboard:view",
  orders: "orders:view",
  production: "production:view",
  products: "products:view",
  collections: "collections:view",
  customers: "customers:view",
  consultations: "consultations:view",
  measurements: "measurements:view",
  payments: "payments:view",
  shipping: "settings:view",
  inventory: "settings:view",
  gallery: "website:view",
  reviews: "website:view",
  marketing: "website:view",
  website: "website:view",
  analytics: "analytics:view",
  team: "team:view",
  settings: "settings:view",
};

export function getAdminSectionPermission(section: "dashboard" | AdminSectionSlug) {
  return adminSectionPermissions[section];
}

export function isAdminSectionSlug(value: string): value is AdminSectionSlug {
  return adminSections.includes(value as AdminSectionSlug);
}
