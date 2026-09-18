"use client";

import { PackageCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { markGroupDelivered, setOrderItemStatus } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ItemDestinoLabel } from "@/components/admin/item-destino-label";
import type { OrderItemWithRelations } from "@/types/database";

type GroupKey = string;

function isActiveDelivery(status: string) {
  return status === "pending" || status === "in_progress";
}

function groupItems(items: OrderItemWithRelations[]) {
  const pending = items.filter((i) => isActiveDelivery(i.status));
  const map = new Map<
    GroupKey,
    {
      equipeId: string;
      equipeNome: string;
      slotId: string;
      horario: string;
      items: OrderItemWithRelations[];
    }
  >();

  for (const item of pending) {
    const key = `${item.equipe_destino_id}:${item.delivery_slot_id}`;
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(key, {
        equipeId: item.equipe_destino_id,
        equipeNome: item.teams?.nome ?? "Equipe",
        slotId: item.delivery_slot_id,
        horario: item.delivery_slots?.horario ?? "—",
        items: [item],
      });
    }
  }

  const groups = Array.from(map.values());
  for (const g of groups) {
    g.items.sort(
      (a, b) =>
        new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime(),
    );
  }

  groups.sort((a, b) => {
    const horarioCmp = a.horario.localeCompare(b.horario);
    if (horarioCmp !== 0) return horarioCmp;
    return a.equipeNome.localeCompare(b.equipeNome);
  });

  return groups;
}

export function ItineraryView({
  initialItems,
}: {
  initialItems: OrderItemWithRelations[];
}) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("order_items_itinerary")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        async () => {
          const { data } = await supabase
            .from("order_items")
            .select(
              "*, teams!order_items_equipe_destino_id_fkey(nome), delivery_slots(horario), products(nome, tipo)",
            )
            .order("criado_em", { ascending: true });
          if (data) setItems(data as OrderItemWithRelations[]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const groups = useMemo(() => groupItems(items), [items]);

  const deliverGroup = async (equipeId: string, slotId: string) => {
    const key = `${equipeId}:${slotId}`;
    setBusy(key);
    try {
      await markGroupDelivered(equipeId, slotId);
      setItems((prev) =>
        prev.map((i) =>
          i.equipe_destino_id === equipeId &&
          i.delivery_slot_id === slotId &&
          isActiveDelivery(i.status)
            ? { ...i, status: "delivered" as const }
            : i,
        ),
      );
    } finally {
      setBusy(null);
    }
  };

  const deliverOne = async (id: string) => {
    setBusy(id);
    try {
      await setOrderItemStatus(id, "delivered");
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "delivered" as const } : i,
        ),
      );
    } finally {
      setBusy(null);
    }
  };

  if (groups.length === 0) {
    return (
      <EmptyState
        title="Tudo organizado!"
        description="Não existem entregas pendentes no momento."
        icon={<PackageCheck className="h-7 w-7" strokeWidth={1.75} />}
      />
    );
  }

  return (
    <div className="relative space-y-6 pl-6">
      <div
        className="absolute bottom-4 left-[11px] top-4 w-0.5 bg-primary/20"
        aria-hidden
      />
      {groups.map((group, index) => {
        const key = `${group.equipeId}:${group.slotId}`;
        const isNext = index === 0;
        return (
          <section key={key} className="relative">
            <span
              className={`absolute -left-6 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${isNext ? "bg-primary" : "bg-muted"}`}
            >
              {index + 1}
            </span>
            <Card
              className={`border ${isNext ? "border-primary/30 ring-2 ring-primary/10" : "border-border/80"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {isNext && (
                    <Badge variant="default" className="mb-2">
                      Próxima parada
                    </Badge>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {group.horario}
                  </p>
                  <h2 className="text-lg font-bold text-foreground">
                    {group.equipeNome}
                  </h2>
                  <p className="text-sm text-muted">
                    {group.items.length} item{group.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="text-sm"
                  disabled={busy === key}
                  onClick={() => deliverGroup(group.equipeId, group.slotId)}
                >
                  Grupo entregue
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl bg-background px-3 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <ItemDestinoLabel
                          item={item}
                          className="font-semibold text-foreground"
                        />
                        <p className="text-sm text-muted">
                          {item.products?.nome} · {item.quantidade} un.
                        </p>
                        {item.status === "in_progress" && (
                          <Badge variant="secondary" className="mt-2">
                            Em andamento
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={busy === item.id}
                        onClick={() => deliverOne(item.id)}
                        className="min-h-10 rounded-xl bg-success-soft px-3 text-sm font-semibold text-success"
                      >
                        Entregue
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
