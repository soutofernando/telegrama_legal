import { createAdminClient } from "@/lib/supabase/admin";
import type { SerenataSong } from "@/types/database";

export async function getSerenataSongs(): Promise<SerenataSong[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("serenata_songs")
    .select("*")
    .order("sort_order")
    .order("titulo");

  if (error) throw error;
  return (data ?? []) as SerenataSong[];
}
