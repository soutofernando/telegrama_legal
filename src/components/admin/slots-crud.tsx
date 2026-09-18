"use client";

import { CrudList } from "@/components/admin/crud-list";
import {
  deleteDeliverySlot,
  saveDeliverySlotCrud,
} from "@/app/actions/admin";
import type { DeliverySlot } from "@/types/database";

export function SlotsCrud({ items }: { items: DeliverySlot[] }) {
  return (
    <CrudList<DeliverySlot>
      items={items}
      emptyLabel="Nenhum horário cadastrado."
      renderLabel={(s) => `${s.horario} (ordem ${s.sort_order})`}
      fields={[
        { key: "horario", label: "Horário (ex: 14h)" },
        { key: "sort_order", label: "Ordem", type: "number" },
      ]}
      onSave={saveDeliverySlotCrud}
      onDelete={deleteDeliverySlot}
    />
  );
}
