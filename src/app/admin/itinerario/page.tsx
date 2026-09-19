import { AdminShell } from "@/components/admin/admin-shell";
import { ItineraryView } from "@/components/admin/itinerary-view";
import { ORDER_ITEMS_ADMIN_SELECT } from "@/lib/order-items-select";
import { createClient } from "@/lib/supabase/server";
import type { OrderItemWithRelations } from "@/types/database";

export default async function ItineraryPage() {
  const supabase = await createClient();
  const [{ data }, { data: slots }] = await Promise.all([
    supabase
      .from("order_items")
      .select(ORDER_ITEMS_ADMIN_SELECT)
      .order("criado_em", { ascending: true }),
    supabase.from("delivery_slots").select("*").order("sort_order"),
  ]);

  return (
    <AdminShell
      title="Itinerário"
      subtitle="Entregas e retiradas no balcão"
    >
      <ItineraryView
        initialItems={(data ?? []) as OrderItemWithRelations[]}
        slots={slots ?? []}
      />
    </AdminShell>
  );
}
