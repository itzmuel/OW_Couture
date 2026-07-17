import { notFound } from "next/navigation";

import { AdminAnalyticsPageClient } from "@/components/admin/admin-analytics-page-client";
import { AdminCollectionsPageClient } from "@/components/admin/admin-collections-page-client";
import { AdminCustomersPageClient } from "@/components/admin/admin-customers-page-client";
import { AdminMeasurementsPageClient } from "@/components/admin/admin-measurements-page-client";
import { AdminOrdersPageClient } from "@/components/admin/admin-orders-page-client";
import { AdminPaymentsPageClient } from "@/components/admin/admin-payments-page-client";
import { AdminProductsPageClient } from "@/components/admin/admin-products-page-client";
import { AdminProductionPageClient } from "@/components/admin/admin-production-page-client";
import { AdminTeamPageClient } from "@/components/admin/admin-team-page-client";
import { AdminWebsitePageClient } from "@/components/admin/admin-website-page-client";
import { AdminPageClient } from "@/components/admin-page-client";
import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { getAdminSectionPermission, isAdminSectionSlug } from "@/lib/admin/navigation";
import { ensureAdminUser } from "@/lib/supabase/admin-auth";

export default async function AdminSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isAdminSectionSlug(section)) {
    notFound();
  }

  const adminCheck = await ensureAdminUser(getAdminSectionPermission(section));
  if (!adminCheck.ok) {
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

  if (section === "products") {
    return <AdminProductsPageClient />;
  }

  if (section === "collections") {
    return <AdminCollectionsPageClient />;
  }

  if (section === "measurements") {
    return <AdminMeasurementsPageClient />;
  }

  if (section === "analytics") {
    return <AdminAnalyticsPageClient />;
  }

  if (section === "website") {
    return <AdminWebsitePageClient />;
  }

  if (section === "team") {
    return <AdminTeamPageClient />;
  }

  return <AdminSectionPage section={section} />;
}
