"use client";

import { useMemo, useState } from "react";
import { setOrderItemStatus } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/format";
import { formatPrendaDestino } from "@/lib/gift-product";
import { FULFILLMENT_LABELS } from "@/lib/fulfillment";
import type { OrderItemWithRelations } from "@/types/database";

export function ItemsTable({
  items,
  teams,
  slots,
}: {
  items: OrderItemWithRelations[];
  teams: { id: string; nome: string }[];
  slots: { id: string; horario: string }[];
}) {
  const [teamFilter, setTeamFilter] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "delivered">(
    "",
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (teamFilter && item.equipe_destino_id !== teamFilter) return false;
      if (slotFilter && item.delivery_slot_id !== slotFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, teamFilter, slotFilter, statusFilter]);

  const markDelivered = async (id: string) => {
    setLoadingId(id);
    try {
      await setOrderItemStatus(id, "delivered");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas as equipes</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <select
          value={slotFilter}
          onChange={(e) => setSlotFilter(e.target.value)}
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os horários</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>{s.horario}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | "pending" | "delivered")
          }
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="pending">Falta entregar</option>
          <option value="delivered">Entregue</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Destino</th>
              <th className="px-4 py-2 font-medium">Produto</th>
              <th className="px-4 py-2 font-medium">Qtd</th>
              <th className="px-4 py-2 font-medium">Pedido</th>
              <th className="px-4 py-2 font-medium">Recebimento</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-neutral-50">
                <td className="px-4 py-3 text-neutral-800">
                  {item.eh_presente
                    ? formatPrendaDestino(
                        item.nome_recebedor,
                        item.teams?.nome ?? "—",
                      )
                    : `${item.nome_recebedor} · ${item.teams?.nome ?? "—"}`}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {item.products?.nome ?? "—"}
                </td>
                <td className="px-4 py-3">{item.quantidade}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatDateTime(item.criado_em)}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  <span className="block font-medium text-neutral-800">
                    {FULFILLMENT_LABELS[item.fulfillment_type ?? "delivery"]}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {item.delivery_slots?.horario ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      item.status === "delivered"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }
                  >
                    {item.status === "delivered" ? "Entregue" : "Falta entregar"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {item.status === "pending" && (
                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => markDelivered(item.id)}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-50"
                    >
                      Marcar entregue
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-neutral-500">
            Nenhum item encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
