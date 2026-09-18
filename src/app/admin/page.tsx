import { Banknote, Gift, Hand, Package, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { DeliveryTime } from "@/components/ui/delivery-time";
import { StatCard } from "@/components/ui/stat-card";
import { loadFinanceSummary } from "@/lib/finance";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { ItemDestinoLabel } from "@/components/admin/item-destino-label";
import type { OrderItemWithRelations } from "@/types/database";

async function loadDashboard() {
  const supabase = await createClient();
  const [teams, products, itemsCount, itemsRes, finance] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("order_items").select("id", { count: "exact", head: true }),
    supabase
      .from("order_items")
      .select(
        "*, teams!order_items_equipe_destino_id_fkey(nome), delivery_slots(horario), products(nome, tipo)",
      )
      .order("criado_em", { ascending: false })
      .limit(50),
    loadFinanceSummary(supabase),
  ]);

  const items = (itemsRes.data ?? []) as OrderItemWithRelations[];
  const pendingDeliveries = items.filter(
    (i) => i.status === "pending" || i.status === "in_progress",
  ).length;

  const upcoming = items
    .filter((i) => i.status === "pending" || i.status === "in_progress")
    .slice(0, 5);

  const recent = items.slice(0, 6);

  return {
    teamCount: teams.count ?? 0,
    productCount: products.count ?? 0,
    itemCount: itemsCount.count ?? items.length,
    pendingDeliveries,
    upcoming,
    recent,
    finance,
  };
}

export default async function AdminHomePage() {
  const data = await loadDashboard();

  return (
    <AdminShell>
      <header className="mb-6">
        <p className="flex items-center gap-2 text-2xl font-bold text-foreground">
          Olá!
          <Hand className="h-7 w-7 text-primary" strokeWidth={2} aria-hidden />
        </p>
        <p className="mt-1 text-base text-muted">
          Organize o encontro por aqui.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Arrecadado"
          value={formatCurrency(data.finance.totalRevenue)}
          icon={<Banknote className="h-5 w-5" strokeWidth={2} />}
          href="/admin/financeiro"
        />
        <StatCard
          label="Equipes"
          value={data.teamCount}
          icon={<Users className="h-5 w-5" strokeWidth={2} />}
          href="/admin/equipes"
        />
        <StatCard
          label="Itens"
          value={data.itemCount}
          icon={<Gift className="h-5 w-5" strokeWidth={2} />}
          href="/admin/itens"
        />
        <StatCard
          label="Pendentes"
          value={data.pendingDeliveries}
          icon={<Package className="h-5 w-5" strokeWidth={2} />}
          href="/admin/itens"
        />
        <StatCard
          label="Produtos"
          value={data.productCount}
          icon={<ShoppingBag className="h-5 w-5" strokeWidth={2} />}
          href="/admin/produtos"
        />
        <StatCard
          label="Hoje"
          value={formatCurrency(data.finance.todayRevenue)}
          icon={<Banknote className="h-5 w-5" strokeWidth={2} />}
          href="/admin/financeiro"
        />
      </div>

      <section className="mt-8">
        <SectionHeader
          title="Próximas entregas"
          action={
            <Link
              href="/admin/itens"
              className="text-sm font-semibold text-primary"
            >
              Ver tudo
            </Link>
          }
        />
        {data.upcoming.length === 0 ? (
          <Card className="border border-border/60 text-center text-sm text-muted">
            Nenhuma entrega pendente no momento.
          </Card>
        ) : (
          <ul className="space-y-3">
            {data.upcoming.map((item) => (
              <li key={item.id}>
                <Card className="border border-border/60" padding="sm">
                  <DeliveryTime horario={item.delivery_slots?.horario} />
                  <ItemDestinoLabel
                    item={item}
                    className="mt-1 font-bold text-foreground"
                  />
                  <p className="mt-2 text-sm text-foreground">
                    {item.products?.nome} · {item.quantidade} un.
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader title="Atividade recente" />
        <ul className="space-y-2">
          {data.recent.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-card)]"
            >
              <div className="min-w-0">
                <ItemDestinoLabel
                  item={item}
                  className="truncate text-sm font-semibold text-foreground"
                />
                <p className="truncate text-xs text-muted">
                  {item.products?.nome}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted">
                {formatDateTime(item.criado_em)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
