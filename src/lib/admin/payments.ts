export type AdminPaymentRow = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  paymentStatus: "pending" | "paid" | "refunded" | "cancelled";
  amount: number;
  currency: string;
  orderStatus: string;
};

export type AdminPaymentsPayload = {
  summary: {
    paid: number;
    pending: number;
    refunded: number;
    cancelled: number;
    totalRevenue: number;
  };
  payments: AdminPaymentRow[];
};

export function formatPaymentMoney(value: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
