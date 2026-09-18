import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsManager } from "@/components/admin/products-manager";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export default async function ProductsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("nome");

  return (
    <AdminShell title="Produtos" subtitle="Catálogo e estoque">
      <ProductsManager products={(data ?? []) as Product[]} />
    </AdminShell>
  );
}
