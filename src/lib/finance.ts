import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FinanceByProduct,
  FinanceRecentOrder,
  FinanceSummary,
} from "@/lib/finance-types";
import type { PaymentMethod } from "@/types/database";

export type {
  FinanceByProduct,
  FinanceRecentOrder,
  FinanceSummary,
} from "@/lib/finance-types";

export { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";

type FinanceRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantidade: number;
  valor_linha: number | null;
  criado_em: string;
  products: { nome: string; preco: number } | null;
  orders: {
    forma_pagamento: PaymentMethod;
    criado_em: string;
    nome_comprador: string;
  } | null;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function lineRevenue(preco: number | string, quantidade: number): number {
  return Number(preco) * quantidade;
}

export function aggregateFinance(rows: FinanceRow[]): FinanceSummary {
  const todayStart = startOfToday();
  const orderIds = new Set<string>();
  const todayOrderIds = new Set<string>();
  let totalRevenue = 0;
  let unitsSold = 0;
  let todayRevenue = 0;

  const byPayment: FinanceSummary["byPayment"] = {
    whatsapp: { revenue: 0, orderIds: new Set() },
    on_delivery: { revenue: 0, orderIds: new Set() },
    vendor_paid: { revenue: 0, orderIds: new Set() },
  };

  const productMap = new Map<string, FinanceByProduct>();
  const orderMap = new Map<string, FinanceRecentOrder>();

  for (const row of rows) {
    const preco = row.products?.preco ?? 0;
    const revenue =
      row.valor_linha != null
        ? Number(row.valor_linha)
        : lineRevenue(preco, row.quantidade);
    const payment = row.orders?.forma_pagamento ?? "on_delivery";
    const soldAt = new Date(row.criado_em);

    totalRevenue += revenue;
    unitsSold += row.quantidade;
    orderIds.add(row.order_id);

    byPayment[payment].revenue += revenue;
    byPayment[payment].orderIds.add(row.order_id);

    if (soldAt >= todayStart) {
      todayRevenue += revenue;
      todayOrderIds.add(row.order_id);
    }

    const existing = productMap.get(row.product_id);
    if (existing) {
      existing.units += row.quantidade;
      existing.revenue += revenue;
    } else {
      productMap.set(row.product_id, {
        productId: row.product_id,
        name: row.products?.nome ?? "Produto",
        units: row.quantidade,
        revenue,
      });
    }

    const orderEntry = orderMap.get(row.order_id);
    if (orderEntry) {
      orderEntry.total += revenue;
      orderEntry.units += row.quantidade;
      if (soldAt > new Date(orderEntry.criadoEm)) {
        orderEntry.criadoEm = row.criado_em;
      }
    } else {
      orderMap.set(row.order_id, {
        orderId: row.order_id,
        buyerName: row.orders?.nome_comprador ?? "—",
        paymentMethod: payment,
        criadoEm: row.criado_em,
        total: revenue,
        units: row.quantidade,
      });
    }
  }

  const byProduct = [...productMap.values()].sort(
    (a, b) => b.revenue - a.revenue,
  );

  const recentOrders = [...orderMap.values()].sort(
    (a, b) =>
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
  );

  return {
    totalRevenue,
    orderCount: orderIds.size,
    unitsSold,
    todayRevenue,
    todayOrderCount: todayOrderIds.size,
    byPayment,
    byProduct,
    recentOrders,
  };
}

export async function loadFinanceSummary(
  supabaseClient?: SupabaseClient,
): Promise<FinanceSummary> {
  const supabase = supabaseClient ?? (await createClient());
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      order_id,
      product_id,
      quantidade,
      valor_linha,
      criado_em,
      products ( nome, preco ),
      orders ( forma_pagamento, criado_em, nome_comprador )
    `,
    )
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows: FinanceRow[] = (data ?? []).map((row) => {
    const products = row.products;
    const orders = row.orders;
    return {
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      quantidade: row.quantidade,
      valor_linha: row.valor_linha as number | null,
      criado_em: row.criado_em,
      products: Array.isArray(products) ? (products[0] ?? null) : products,
      orders: Array.isArray(orders) ? (orders[0] ?? null) : orders,
    };
  });

  return aggregateFinance(rows);
}
