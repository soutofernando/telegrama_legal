"use client";

import { useEffect, useState } from "react";
import { ORDER_ITEMS_ADMIN_SELECT } from "@/lib/order-items-select";
import { createClient } from "@/lib/supabase/client";
import { ItemsKanban } from "@/components/admin/items-kanban";
import type { OrderItemWithRelations } from "@/types/database";

export function ItemsRealtime({
  initialItems,
  teams,
  slots,
}: {
  initialItems: OrderItemWithRelations[];
  teams: { id: string; nome: string }[];
  slots: { id: string; horario: string }[];
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("order_items_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        async () => {
          const { data } = await supabase
            .from("order_items")
            .select(ORDER_ITEMS_ADMIN_SELECT)
            .order("criado_em", { ascending: false });
          if (data) setItems(data as OrderItemWithRelations[]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <ItemsKanban items={items} teams={teams} slots={slots} />;
}
