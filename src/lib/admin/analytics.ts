export type AnalyticsKpi = {
  label: string;
  value: string;
  helper: string;
};

export type AnalyticsSeries = {
  title: string;
  values: number[];
  labels: string[];
  format: "currency" | "count";
};

export type AdminAnalyticsPayload = {
  kpis: AnalyticsKpi[];
  charts: AnalyticsSeries[];
  insights: string[];
};

export function formatAnalyticsCurrency(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
