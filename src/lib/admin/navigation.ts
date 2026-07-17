export type AdminNavItem = {
  label: string;
  href: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", description: "Business command center" },
  { label: "Orders", href: "/admin/orders", description: "Order intake and fulfillment" },
  { label: "Production", href: "/admin/production", description: "Made-to-order stage tracker" },
  { label: "Products", href: "/admin/products", description: "Catalog, media, and SEO" },
  { label: "Collections", href: "/admin/collections", description: "Wedding, RTW, Evening, Seasonal" },
  { label: "Customers", href: "/admin/customers", description: "Client profiles and lifetime value" },
  { label: "Consultations", href: "/admin/consultations", description: "Bookings and status management" },
  { label: "Measurements", href: "/admin/measurements", description: "Body measurements and version history" },
  { label: "Payments", href: "/admin/payments", description: "Paid, pending, refunded" },
  { label: "Shipping", href: "/admin/shipping", description: "Region rules and rates" },
  { label: "Inventory", href: "/admin/inventory", description: "Fabric and packaging stock" },
  { label: "Gallery", href: "/admin/gallery", description: "Campaign and lookbook media" },
  { label: "Reviews", href: "/admin/reviews", description: "Testimonials moderation" },
  { label: "Marketing", href: "/admin/marketing", description: "Discounts and email flows" },
  { label: "Website", href: "/admin/website", description: "CMS for site content" },
  { label: "Analytics", href: "/admin/analytics", description: "Revenue and conversion metrics" },
  { label: "Team", href: "/admin/team", description: "Roles and permissions" },
  { label: "Settings", href: "/admin/settings", description: "Operational configuration" },
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

export function isAdminSectionSlug(value: string): value is AdminSectionSlug {
  return adminSections.includes(value as AdminSectionSlug);
}
