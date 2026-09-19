import type { PaymentMethod } from "@/types/database";

export type FinanceByProduct = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};

export type FinanceRecentOrder = {
  orderId: string;
  buyerName: string;
  paymentMethod: PaymentMethod;
  criadoEm: string;
  total: number;
  units: number;
};

export type FinanceSummary = {
  totalRevenue: number;
  orderCount: number;
  unitsSold: number;
  todayRevenue: number;
  todayOrderCount: number;
  byPayment: Record<
    PaymentMethod,
    { revenue: number; orderIds: Set<string> }
  >;
  byProduct: FinanceByProduct[];
  recentOrders: FinanceRecentOrder[];
};
