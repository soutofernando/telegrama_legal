import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicProduct } from "@/types/database";

type ProductRow = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_promocional: number | null;
  promo_combo_quantidade: number | null;
  promo_combo_preco: number | null;
  imagem_url: string;
  tipo: PublicProduct["tipo"];
  estoque: number;
};

function toPublicProduct(row: ProductRow): PublicProduct {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: row.preco,
    preco_promocional: row.preco_promocional,
    promo_combo_quantidade: row.promo_combo_quantidade,
    promo_combo_preco: row.promo_combo_preco,
    imagem_url: row.imagem_url,
    tipo: row.tipo,
    disponivel: row.estoque > 0,
  };
}

/** Ordem de cadastro; usa `products` para não depender de colunas da view pública. */
export async function getPublicProducts(): Promise<PublicProduct[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, nome, descricao, preco, preco_promocional, promo_combo_quantidade, promo_combo_preco, imagem_url, tipo, estoque",
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toPublicProduct(row as ProductRow));
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
