export type MeasurementSnapshot = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  measurements: Record<string, string | number | null>;
};

export type AdminMeasurementProfile = {
  email: string;
  customerName: string;
  latestOrderId: string;
  latestOrderDate: string;
  latestMeasurements: Record<string, string | number | null>;
  history: MeasurementSnapshot[];
};
