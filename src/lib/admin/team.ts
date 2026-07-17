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
