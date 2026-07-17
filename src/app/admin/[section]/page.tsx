import { notFound } from "next/navigation";

import { AdminPageClient } from "@/components/admin-page-client";
import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { isAdminSectionSlug } from "@/lib/admin/navigation";

export default async function AdminSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isAdminSectionSlug(section)) {
    notFound();
  }

  if (section === "consultations") {
    return <AdminPageClient />;
  }

  return <AdminSectionPage section={section} />;
}
