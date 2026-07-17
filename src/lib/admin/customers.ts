export type AdminCustomer = {
  email: string;
  name: string;
  orderCount: number;
  consultationCount: number;
  lifetimeSpend: number;
  lastVisit: string | null;
  latestMeasurements: Record<string, string | number | null>;
  latestNotes: string[];
  vip: boolean;
};

export function formatCustomerMoney(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
