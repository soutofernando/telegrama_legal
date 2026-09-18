import { AdminShell } from "@/components/admin/admin-shell";
import { TeamsManager } from "@/components/admin/teams-manager";
import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/types/database";

function countPending(
  rows: { equipe_destino_id: string; status: string }[],
) {
  const map: Record<string, number> = {};
  for (const row of rows) {
    if (row.status !== "pending" && row.status !== "in_progress") continue;
    map[row.equipe_destino_id] = (map[row.equipe_destino_id] ?? 0) + 1;
  }
  return map;
}

export default async function TeamsAdminPage() {
  const supabase = await createClient();
  const [teamsRes, itemsRes] = await Promise.all([
    supabase.from("teams").select("*").order("nome"),
    supabase
      .from("order_items")
      .select("equipe_destino_id, status"),
  ]);

  return (
    <AdminShell title="Equipes" subtitle="Quem recebe as entregas">
      <TeamsManager
        teams={(teamsRes.data ?? []) as Team[]}
        pendingByTeam={countPending(itemsRes.data ?? [])}
      />
    </AdminShell>
  );
}
