import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { redirect } from "next/navigation";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export default async function AdminPage() {
  const adminCheck = await ensureAdminUser("dashboard:view");

  if (!adminCheck.ok) {
    if (adminCheck.status === 401) {
      redirect("/auth/login?next=/admin");
    }

    redirect("/");
  }

  return <AdminDashboard />;
}