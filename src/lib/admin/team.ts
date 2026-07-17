export type AdminTeamMember = {
  email: string;
  fullName: string;
  role: "Admin" | "Manager" | "Tailor" | "Customer Service";
  permissions: string[];
  active: boolean;
};

export type AdminPermission =
  | "admin:*"
  | "dashboard:view"
  | "orders:view"
  | "orders:manage"
  | "production:view"
  | "production:manage"
  | "products:view"
  | "products:manage"
  | "products:archive"
  | "collections:view"
  | "collections:manage"
  | "collections:archive"
  | "customers:view"
  | "consultations:view"
  | "consultations:manage"
  | "measurements:view"
  | "payments:view"
  | "payments:manage"
  | "analytics:view"
  | "website:view"
  | "website:manage"
  | "team:view"
  | "team:manage"
  | "settings:view";

export const allAdminPermissions: AdminPermission[] = [
  "admin:*",
  "dashboard:view",
  "orders:view",
  "orders:manage",
  "production:view",
  "production:manage",
  "products:view",
  "products:manage",
  "products:archive",
  "collections:view",
  "collections:manage",
  "collections:archive",
  "customers:view",
  "consultations:view",
  "consultations:manage",
  "measurements:view",
  "payments:view",
  "payments:manage",
  "analytics:view",
  "website:view",
  "website:manage",
  "team:view",
  "team:manage",
  "settings:view",
];

export const permissionLabels: Record<AdminPermission, string> = {
  "admin:*": "Full admin access",
  "dashboard:view": "View dashboard",
  "orders:view": "View orders",
  "orders:manage": "Manage orders",
  "production:view": "View production",
  "production:manage": "Manage production",
  "products:view": "View products",
  "products:manage": "Manage products",
  "products:archive": "Archive products",
  "collections:view": "View collections",
  "collections:manage": "Manage collections",
  "collections:archive": "Archive collections",
  "customers:view": "View customers",
  "consultations:view": "View consultations",
  "consultations:manage": "Manage consultations",
  "measurements:view": "View measurements",
  "payments:view": "View payments",
  "payments:manage": "Manage payments",
  "analytics:view": "View analytics",
  "website:view": "View website CMS",
  "website:manage": "Manage website CMS",
  "team:view": "View team",
  "team:manage": "Manage team",
  "settings:view": "View settings",
};

export const defaultRolePermissions: Record<AdminTeamMember["role"], AdminPermission[]> = {
  Admin: ["admin:*"],
  Manager: [
    "dashboard:view",
    "orders:view",
    "orders:manage",
    "production:view",
    "production:manage",
    "products:view",
    "products:manage",
    "collections:view",
    "collections:manage",
    "customers:view",
    "consultations:view",
    "consultations:manage",
    "measurements:view",
    "payments:view",
    "payments:manage",
    "analytics:view",
    "website:view",
    "website:manage",
  ],
  Tailor: ["dashboard:view", "orders:view", "production:view", "production:manage", "measurements:view", "customers:view"],
  "Customer Service": ["dashboard:view", "orders:view", "consultations:view", "consultations:manage", "customers:view", "payments:view"],
};

export function hasAdminPermission(permissions: string[], requiredPermission?: AdminPermission) {
  if (!requiredPermission) {
    return true;
  }

  if (permissions.includes("admin:*")) {
    return true;
  }

  return permissions.includes(requiredPermission);
}
