import { AdminShell } from "@/components/admin/admin-shell";
import { SerenataSongsManager } from "@/components/admin/serenata-songs-manager";
import { createClient } from "@/lib/supabase/server";
import type { SerenataSong } from "@/types/database";

export default async function SerenatasAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("serenata_songs")
    .select("*")
    .order("sort_order")
    .order("titulo");

  return (
    <AdminShell title="Músicas de serenata" subtitle="Catálogo para o cliente escolher na loja">
      <SerenataSongsManager songs={(data ?? []) as SerenataSong[]} />
    </AdminShell>
  );
}
