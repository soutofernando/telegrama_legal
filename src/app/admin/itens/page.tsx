import { AdminShell } from "@/components/admin/admin-shell";
import { ItemsRealtime } from "@/components/admin/items-realtime";
import { ManualItemForm } from "@/components/admin/manual-item-form";
import { ORDER_ITEMS_ADMIN_SELECT } from "@/lib/order-items-select";
import { createClient } from "@/lib/supabase/server";
import type { OrderItemWithRelations } from "@/types/database";

async function loadItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_items")
    .select(ORDER_ITEMS_ADMIN_SELECT)
    .order("criado_em", { ascending: false });
  return (data ?? []) as OrderItemWithRelations[];
}

export default async function ItemsAdminPage() {
  const supabase = await createClient();
  const [items, teamsRes, slotsRes, productsRes] = await Promise.all([
    loadItems(),
    supabase.from("teams").select("id, nome").order("nome"),
    supabase.from("delivery_slots").select("id, horario").order("sort_order"),
    supabase.from("products").select("id, nome").order("nome"),
  ]);

  return (
    <AdminShell
      title="Itens / prendas"
      subtitle="Quadro de entregas"
      action={<ManualItemForm
        teams={teamsRes.data ?? []}
        slots={slotsRes.data ?? []}
        products={productsRes.data ?? []}
      />}
    >
      <ItemsRealtime
        initialItems={items}
        teams={teamsRes.data ?? []}
        slots={slotsRes.data ?? []}
      />
    </AdminShell>
  );
}
