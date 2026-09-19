import { AdminShell } from "@/components/admin/admin-shell";
import { ItineraryView } from "@/components/admin/itinerary-view";
import { createClient } from "@/lib/supabase/server";
import type { OrderItemWithRelations } from "@/types/database";

export default async function ItineraryPage() {
  const supabase = await createClient();
  const [{ data }, { data: slots }] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "*, teams!order_items_equipe_destino_id_fkey(nome), delivery_slots(horario, sort_order), products(nome, tipo)",
      )
      .order("criado_em", { ascending: true }),
    supabase.from("delivery_slots").select("*").order("sort_order"),
  ]);

  return (
    <AdminShell
      title="Itinerário"
      subtitle="Rota de entrega no celular"
    >
      <ItineraryView
        initialItems={(data ?? []) as OrderItemWithRelations[]}
        slots={slots ?? []}
      />
    </AdminShell>
  );
}
