import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicProduct } from "@/types/database";

export async function getPublicProducts(): Promise<PublicProduct[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("public_products")
    .select("*")
    .order("nome");

  if (error) throw error;
  return (data ?? []) as PublicProduct[];
}

export async function getPublicProductById(
  id: string,
): Promise<PublicProduct | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("public_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as PublicProduct | null;
}

export async function getProductMaxQuantity(
  productId: string,
): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_product_max_quantity", {
    p_product_id: productId,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

export async function getProductMaxQuantities(
  productIds: string[],
): Promise<Record<string, number>> {
  const entries = await Promise.all(
    productIds.map(async (id) => [id, await getProductMaxQuantity(id)] as const),
  );
  return Object.fromEntries(entries);
}
