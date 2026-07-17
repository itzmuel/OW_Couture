export type AdminDashboardMetric = {
  label: string;
  value: string;
  tone?: "default" | "muted";
};

export type AdminDashboardChart = {
  title: string;
  values: number[];
  subtitle: string;
};

export type AdminDashboardPayload = {
  greetingName: string;
  summaryCards: AdminDashboardMetric[];
  chartTiles: AdminDashboardChart[];
  notes: string[];
};

export type DashboardOrderRow = {
  id: string;
  customer_email: string;
  order_date: string;
  status: string;
  payment_status: string;
  production_stage: string;
  total_amount: number;
  created_at: string;
};

export type DashboardConsultationRow = {
  id: string;
  email: string;
  requested_date: string | null;
  status: string;
  created_at: string;
};

export type DashboardOrderItemRow = {
  product_slug: string;
  product_name: string;
  quantity: number;
};

export function formatMoney(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
