import { redirect } from "next/navigation";

import { AdminPageClient } from "@/components/admin-page-client";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminCheck = await ensureAdminUser();

  if (!adminCheck.ok) {
    if (adminCheck.status === 401) {
      redirect("/auth/login?next=/admin");
    }

    redirect("/");
  }

  return <AdminPageClient />;
}