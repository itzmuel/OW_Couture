import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminCheck = await ensureAdminUser("dashboard:view");

  if (!adminCheck.ok) {
    if (adminCheck.status === 401) {
      redirect("/auth/login?next=/admin");
    }

    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
