import { notFound } from "next/navigation";

import { AdminCustomersPageClient } from "@/components/admin/admin-customers-page-client";
import { AdminMeasurementsPageClient } from "@/components/admin/admin-measurements-page-client";
import { AdminOrdersPageClient } from "@/components/admin/admin-orders-page-client";
import { AdminPaymentsPageClient } from "@/components/admin/admin-payments-page-client";
import { AdminProductionPageClient } from "@/components/admin/admin-production-page-client";
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

  if (section === "orders") {
    return <AdminOrdersPageClient />;
  }

  if (section === "production") {
    return <AdminProductionPageClient />;
  }

  if (section === "customers") {
    return <AdminCustomersPageClient />;
  }

  if (section === "payments") {
    return <AdminPaymentsPageClient />;
  }

  if (section === "measurements") {
    return <AdminMeasurementsPageClient />;
  }

  return <AdminSectionPage section={section} />;
}
