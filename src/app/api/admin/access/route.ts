import { NextResponse } from "next/server";

import { adminNavItems } from "@/lib/admin/navigation";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";
import { hasAdminPermission } from "@/lib/admin/team";

export async function GET() {
  const adminCheck = await ensureAdminUser();

  if (!adminCheck.ok) {
    return NextResponse.json({ isAdmin: false, allowedSections: [] }, { status: 200 });
  }

  const allowedSections = adminNavItems
    .filter((item) => {
      return hasAdminPermission(adminCheck.permissions, item.section === "dashboard" ? "dashboard:view" : undefined) || item.section !== "dashboard";
    })
    .filter((item) => {
      if (item.section === "dashboard") {
        return hasAdminPermission(adminCheck.permissions, "dashboard:view");
      }

      return true;
    })
    .map((item) => item.section);

  return NextResponse.json({ isAdmin: true, allowedSections, permissions: adminCheck.permissions, role: adminCheck.role }, { status: 200 });
}
