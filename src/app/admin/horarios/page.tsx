import { AdminShell } from "@/components/admin/admin-shell";
import { SlotsManager } from "@/components/admin/slots-manager";
import { createClient } from "@/lib/supabase/server";
import type { DeliverySlot } from "@/types/database";

function countPending(
  rows: { delivery_slot_id: string; status: string }[],
) {
  const map: Record<string, number> = {};
  for (const row of rows) {
    if (row.status !== "pending" && row.status !== "in_progress") continue;
    map[row.delivery_slot_id] = (map[row.delivery_slot_id] ?? 0) + 1;
  }
  return map;
}

export default async function SlotsAdminPage() {
  const supabase = await createClient();
  const [slotsRes, itemsRes] = await Promise.all([
    supabase.from("delivery_slots").select("*").order("sort_order"),
    supabase
      .from("order_items")
      .select("delivery_slot_id, status"),
  ]);

  return (
    <AdminShell title="Horários" subtitle="Janelas de entrega">
      <SlotsManager
        slots={(slotsRes.data ?? []) as DeliverySlot[]}
        pendingBySlot={countPending(itemsRes.data ?? [])}
      />
    </AdminShell>
  );
}
