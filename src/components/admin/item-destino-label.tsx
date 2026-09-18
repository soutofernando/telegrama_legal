import { formatPrendaDestino } from "@/lib/gift-product";
import type { OrderItemWithRelations } from "@/types/database";

export function ItemDestinoLabel({
  item,
  className,
}: {
  item: OrderItemWithRelations;
  className?: string;
}) {
  const equipeNome = item.teams?.nome ?? "—";
  const text = item.eh_presente
    ? formatPrendaDestino(item.nome_recebedor, equipeNome)
    : `${item.nome_recebedor} · ${equipeNome}`;

  return <p className={className}>{text}</p>;
}
