import {
  Banknote,
  CalendarDays,
  CreditCard,
  Package,
  ShoppingCart,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  FinanceProductList,
  FinanceRecentOrdersList,
} from "@/components/admin/finance-lists";
import { formatCurrency } from "@/lib/format";
import {
  loadFinanceSummary,
  PAYMENT_METHOD_LABELS,
} from "@/lib/finance";
import type { PaymentMethod } from "@/types/database";

const PAYMENT_ORDER: PaymentMethod[] = ["whatsapp", "on_delivery"];

export default async function FinanceAdminPage() {
  const finance = await loadFinanceSummary();

  return (
    <AdminShell
      title="Financeiro"
      subtitle="Totais acumulados a partir das vendas na loja"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total arrecadado"
          value={formatCurrency(finance.totalRevenue)}
          icon={<Banknote className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Pedidos"
          value={finance.orderCount}
          icon={<ShoppingCart className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Unidades vendidas"
          value={finance.unitsSold}
          icon={<Package className="h-5 w-5" strokeWidth={2} />}
        />
        <StatCard
          label="Hoje"
          value={formatCurrency(finance.todayRevenue)}
          icon={<CalendarDays className="h-5 w-5" strokeWidth={2} />}
        />
      </div>

      {finance.orderCount === 0 ? (
        <Card className="mt-8 border border-border/60 text-center text-sm text-muted">
          Ainda não há vendas registradas. Os valores aparecerão aqui conforme
          os pedidos forem feitos na vitrine.
        </Card>
      ) : (
        <>
          <section className="mt-8">
            <SectionHeader title="Por forma de pagamento" />
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_ORDER.map((method) => {
                const bucket = finance.byPayment[method];
                return (
                  <Card
                    key={method}
                    className="border border-border/60"
                    padding="sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <CreditCard className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-muted">
                          {PAYMENT_METHOD_LABELS[method]}
                        </p>
                        <p className="mt-1 text-xl font-bold text-foreground">
                          {formatCurrency(bucket.revenue)}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {bucket.orderIds.size}{" "}
                          {bucket.orderIds.size === 1 ? "pedido" : "pedidos"}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {finance.todayOrderCount > 0 && (
              <p className="mt-3 text-sm text-muted">
                Hoje: {finance.todayOrderCount}{" "}
                {finance.todayOrderCount === 1 ? "pedido" : "pedidos"} ·{" "}
                {formatCurrency(finance.todayRevenue)}
              </p>
            )}
          </section>

          <section className="mt-8">
            <SectionHeader title="Por produto" />
            <FinanceProductList products={finance.byProduct} />
          </section>

          <section className="mt-8">
            <SectionHeader title="Vendas recentes" />
            <FinanceRecentOrdersList orders={finance.recentOrders} />
          </section>
        </>
      )}
    </AdminShell>
  );
}
