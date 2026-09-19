"use client";

import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import type { FinanceByProduct, FinanceRecentOrder } from "@/lib/finance-types";

export function FinanceProductList({
  products,
}: {
  products: FinanceByProduct[];
}) {
  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(products, LIST_PAGE_SIZE);

  return (
    <>
      <ul className="space-y-2">
        {visible.map((product) => (
          <li
            key={product.productId}
            className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {product.name}
              </p>
              <p className="text-xs text-muted">
                {product.units}{" "}
                {product.units === 1 ? "unidade" : "unidades"}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-foreground">
              {formatCurrency(product.revenue)}
            </span>
          </li>
        ))}
      </ul>
      <PaginationControls
        className="mt-4"
        page={page}
        totalPages={pages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}

export function FinanceRecentOrdersList({
  orders,
}: {
  orders: FinanceRecentOrder[];
}) {
  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(orders, LIST_PAGE_SIZE);

  return (
    <>
      <ul className="space-y-2">
        {visible.map((order) => (
          <li
            key={order.orderId}
            className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {order.buyerName}
              </p>
              <p className="truncate text-xs text-muted">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]} · {order.units}{" "}
                {order.units === 1 ? "unidade" : "unidades"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-foreground">
                {formatCurrency(order.total)}
              </p>
              <p className="text-xs text-muted">
                {formatDateTime(order.criadoEm)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <PaginationControls
        className="mt-4"
        page={page}
        totalPages={pages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </>
  );
}
