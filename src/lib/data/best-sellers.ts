import { getPublicProducts } from "@/lib/data/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export interface BestSellerItem {
  productId: string;
  nome: string;
  sold: number;
}

export async function getBestSellers(limit = 5): Promise<BestSellerItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantidade");

  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.product_id as string;
    const qty = Number(row.quantidade) || 0;
    totals.set(id, (totals.get(id) ?? 0) + qty);
  }

  const products = await getPublicProducts();
  const byId = new Map(products.map((p) => [p.id, p]));

  const ranked = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId, sold]) => ({
      productId,
      nome: byId.get(productId)?.nome ?? "Produto",
      sold,
    }))
    .filter((item) => byId.has(item.productId));

  if (ranked.length >= limit) return ranked;

  const fallback = products
    .filter((p) => p.disponivel && !ranked.some((r) => r.productId === p.id))
    .slice(0, limit - ranked.length)
    .map((p) => ({ productId: p.id, nome: p.nome, sold: 0 }));

  return [...ranked, ...fallback];
}
