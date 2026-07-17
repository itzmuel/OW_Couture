export const productionStageOrder = [
  "payment-received",
  "measurements-verified",
  "fabric-ordered",
  "pattern-drafted",
  "cutting",
  "sewing",
  "quality-inspection",
  "packaging",
  "shipping",
  "complete",
] as const;

export type ProductionStage = (typeof productionStageOrder)[number];

export const orderStatuses = [
  "awaiting-review",
  "approved",
  "in-production",
  "ready-for-fitting",
  "ready-to-ship",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const paymentStatuses = ["pending", "paid", "refunded", "cancelled"] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export const adminOrderActions = [
  "approve",
  "start-production",
  "ready-for-fitting",
  "ready-to-ship",
  "delivered",
  "cancel",
] as const;

export type AdminOrderAction = (typeof adminOrderActions)[number];

export type ProductionEvent = {
  stage: ProductionStage;
  completed: boolean;
  completedAt: string | null;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  productionStage: ProductionStage;
  totalAmount: number;
  currency: string;
  notes: string | null;
  measurements: Record<string, string | number | null>;
  inspirationUrls: string[];
  shippingAddress: string | null;
  createdAt: string;
  updatedAt: string;
  events: ProductionEvent[];
};

export function isProductionStage(value: string): value is ProductionStage {
  return productionStageOrder.includes(value as ProductionStage);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return paymentStatuses.includes(value as PaymentStatus);
}

export function isAdminOrderAction(value: string): value is AdminOrderAction {
  return adminOrderActions.includes(value as AdminOrderAction);
}

export function stageRank(stage: ProductionStage) {
  return productionStageOrder.indexOf(stage);
}

export function toStageLabel(stage: ProductionStage) {
  return stage.replaceAll("-", " ");
}
