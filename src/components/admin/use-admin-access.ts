"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminPermission } from "@/lib/admin/team";

type AdminAccessPayload = {
  isAdmin: boolean;
  allowedSections: string[];
  permissions: string[];
  role?: string;
};

export function useAdminAccess() {
  const [access, setAccess] = useState<AdminAccessPayload>({
    isAdmin: false,
    allowedSections: [],
    permissions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAccess = async () => {
      const response = await fetch("/api/admin/access", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as Partial<AdminAccessPayload>;
      if (!isMounted) {
        return;
      }

      setAccess({
        isAdmin: Boolean(payload.isAdmin),
        allowedSections: payload.allowedSections ?? [],
        permissions: payload.permissions ?? [],
        role: payload.role,
      });
      setIsLoading(false);
    };

    void loadAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const permissionSet = useMemo(() => new Set(access.permissions), [access.permissions]);

  const hasPermission = (permission: AdminPermission) => {
    return permissionSet.has("admin:*") || permissionSet.has(permission);
  };

  return {
    ...access,
    isLoading,
    hasPermission,
  };
}
