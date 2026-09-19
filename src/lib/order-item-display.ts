import type { OrderItemWithRelations } from "@/types/database";

export function serenataSongTitulo(item: OrderItemWithRelations): string | null {
  const titulo = item.serenata_songs?.titulo?.trim();
  return titulo || null;
}

/** Product name with serenata song when applicable. */
export function formatOrderItemProductLine(
  item: OrderItemWithRelations,
  quantitySuffix = true,
): string {
  const name = item.products?.nome ?? "—";
  const song = serenataSongTitulo(item);
  const base =
    item.products?.tipo === "serenata" && song ? `${name} — ${song}` : name;
  if (!quantitySuffix) return base;
  return `${base} · ${item.quantidade} un.`;
}
