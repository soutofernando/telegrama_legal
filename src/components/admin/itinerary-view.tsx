"use client";

import { ArrowLeft, ChevronRight, PackageCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  setOrderItemStatus,
  setOrderItemsStatus,
} from "@/app/actions/admin";
import { ItemDestinoDetail } from "@/components/admin/item-destino-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeliveryTime } from "@/components/ui/delivery-time";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import {
  collectItineraryDayKeys,
  formatItineraryDateLabel,
  formatItineraryDateShort,
  getTodayItineraryKey,
  isActiveItineraryStatus,
  itemsForItineraryDay,
  sortSlots,
} from "@/lib/itinerary";
import { FULFILLMENT_LABELS } from "@/lib/fulfillment";
import { ORDER_ITEMS_ADMIN_SELECT } from "@/lib/order-items-select";
import { createClient } from "@/lib/supabase/client";
import type { DeliverySlot, OrderItemWithRelations } from "@/types/database";

function statusBadge(status: string) {
  if (status === "delivered") {
    return <Badge variant="success">Entregue</Badge>;
  }
  if (status === "in_progress") {
    return <Badge variant="warning">Em rota</Badge>;
  }
  return <Badge variant="muted">Aguardando</Badge>;
}

export function ItineraryView({
  initialItems,
  slots: initialSlots,
}: {
  initialItems: OrderItemWithRelations[];
  slots: DeliverySlot[];
}) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(getTodayItineraryKey);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [pickedIds, setPickedIds] = useState<Set<string>>(() => new Set());
  const [carrierName, setCarrierName] = useState("");

  const slots = useMemo(() => sortSlots(initialSlots), [initialSlots]);

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
            .select(ORDER_ITEMS_ADMIN_SELECT)
            .order("criado_em", { ascending: true });
          if (data) setItems(data as OrderItemWithRelations[]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dayKeys = useMemo(() => collectItineraryDayKeys(items), [items]);
  const dayItems = useMemo(
    () => itemsForItineraryDay(items, selectedDay),
    [items, selectedDay],
  );

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const slotItems = useMemo(() => {
    if (!selectedSlotId) return [];
    return dayItems
      .filter((i) => i.delivery_slot_id === selectedSlotId)
      .sort(
        (a, b) =>
          new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime(),
      );
  }, [dayItems, selectedSlotId]);

  const activeSlotItems = slotItems.filter((i) =>
    isActiveItineraryStatus(i.status),
  );
  const deliveredSlotItems = slotItems.filter((i) => i.status === "delivered");

  const pendingInSlot = activeSlotItems.filter((i) => i.status === "pending");
  const inRouteInSlot = activeSlotItems.filter(
    (i) => i.status === "in_progress",
  );

  const slotDetailKey = `${selectedDay}|${selectedSlotId ?? ""}`;
  const activePagination = usePaginatedItems(
    activeSlotItems,
    LIST_PAGE_SIZE,
    slotDetailKey,
  );
  const deliveredPagination = usePaginatedItems(
    deliveredSlotItems,
    LIST_PAGE_SIZE,
    `${slotDetailKey}|delivered`,
  );
  const slotsPagination = usePaginatedItems(slots, LIST_PAGE_SIZE, selectedDay);

  const countsBySlot = useMemo(() => {
    const map = new Map<string, { active: number; total: number }>();
    for (const slot of slots) {
      map.set(slot.id, { active: 0, total: 0 });
    }
    for (const item of dayItems) {
      const entry = map.get(item.delivery_slot_id) ?? { active: 0, total: 0 };
      entry.total += 1;
      if (isActiveItineraryStatus(item.status)) entry.active += 1;
      map.set(item.delivery_slot_id, entry);
    }
    return map;
  }, [dayItems, slots]);

  const togglePick = (id: string) => {
    setActionError(null);
    setPickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRoute = async () => {
    const ids = Array.from(pickedIds).filter((id) =>
      pendingInSlot.some((i) => i.id === id),
    );
    if (ids.length === 0) return;
    const nome = carrierName.trim();
    if (!nome) {
      setActionError("Informe quem está levando os itens na rota.");
      return;
    }
    setBusy("route");
    setActionError(null);
    try {
      await setOrderItemsStatus(ids, "in_progress", nome);
      setItems((prev) =>
        prev.map((i) =>
          ids.includes(i.id)
            ? {
                ...i,
                status: "in_progress" as const,
                entregador_nome: nome,
              }
            : i,
        ),
      );
      setPickedIds(new Set());
      setCarrierName("");
    } catch {
      setActionError(
        "Não foi possível colocar em rota. Tente de novo em alguns segundos.",
      );
    } finally {
      setBusy(null);
    }
  };

  const deliverOne = async (id: string) => {
    setBusy(id);
    setActionError(null);
    try {
      await setOrderItemStatus(id, "delivered");
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "delivered" as const } : i,
        ),
      );
    } catch {
      setActionError("Não foi possível marcar como entregue.");
    } finally {
      setBusy(null);
    }
  };

  const openSlot = (slotId: string) => {
    setSelectedSlotId(slotId);
    setPickedIds(new Set());
    setActionError(null);
  };

  const backToSlots = () => {
    setSelectedSlotId(null);
    setPickedIds(new Set());
    setActionError(null);
  };

  if (selectedSlotId && selectedSlot) {
    const pickableCount = pendingInSlot.filter((i) => pickedIds.has(i.id)).length;

    return (
      <div className="space-y-6 pb-4">
        <button
          type="button"
          onClick={backToSlots}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar aos horários
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#1e3a8a] px-6 py-7 text-white shadow-[0_20px_50px_-20px_rgba(30,64,175,0.55)]">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            {formatItineraryDateLabel(selectedDay)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <DeliveryTime
              horario={selectedSlot.horario}
              className="!bg-white/15 !text-white !text-lg !px-4 !py-2"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            {activeSlotItems.length} pendente
            {activeSlotItems.length === 1 ? "" : "s"} (entrega ou retirada) ·
            ordem de chegada
          </p>
        </div>

        {actionError && (
          <p
            className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
            role="alert"
          >
            {actionError}
          </p>
        )}

        {pendingInSlot.length > 0 && (
          <Card
            padding="lg"
            className="border border-primary/15 bg-gradient-to-b from-primary-soft/80 to-card shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="text-base font-bold text-foreground">
                Monte seu pacote
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Selecione os itens que você vai levar, coloque em rota e
                entregue um a um.
              </p>
              <label className="mt-4 block">
                <span className="text-sm font-semibold text-foreground">
                  Quem está na rota
                </span>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="Seu nome"
                  className="input-field mt-2 w-full text-base"
                  autoComplete="name"
                />
              </label>
              <Button
                variant="primary"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                disabled={busy !== null || pickableCount === 0}
                onClick={startRoute}
              >
                <Truck className="h-4 w-4 shrink-0" aria-hidden />
                {busy === "route"
                  ? "Salvando…"
                  : `Colocar em rota (${pickableCount})`}
              </Button>
            </div>
          </Card>
        )}

        {slotItems.length === 0 ? (
          <EmptyState
            title="Nenhuma entrega neste horário"
            description="Não há compras para este horário neste dia."
            icon={<PackageCheck className="h-7 w-7" strokeWidth={1.75} />}
          />
        ) : (
          <ul className="space-y-4">
            {activePagination.visible.map((item) => {
              const canPick = item.status === "pending";
              const checked = pickedIds.has(item.id);
              return (
                <li key={item.id}>
                  <Card
                    padding="lg"
                    className={`border transition-shadow ${
                      checked
                        ? "border-primary/40 ring-2 ring-primary/15"
                        : item.status === "in_progress"
                          ? "border-warning/50 ring-1 ring-warning/25"
                          : "border-border/70 hover:shadow-md"
                    }`}
                  >
                    <div className="flex gap-4">
                      {canPick && (
                        <label className="mt-2 flex cursor-pointer items-start">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePick(item.id)}
                            className="h-5 w-5 shrink-0 rounded-md border-border accent-primary"
                            aria-label="Incluir no meu pacote"
                          />
                        </label>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-4 flex flex-wrap items-start justify-end gap-2">
                          <Badge variant="muted">
                            {
                              FULFILLMENT_LABELS[
                                item.fulfillment_type ?? "delivery"
                              ]
                            }
                          </Badge>
                          {item.status === "in_progress" &&
                            item.entregador_nome && (
                              <Badge variant="secondary">
                                Com {item.entregador_nome}
                              </Badge>
                            )}
                          {statusBadge(item.status)}
                        </div>
                        <ItemDestinoDetail item={item} />
                        {item.status === "in_progress" && (
                          <Button
                            variant="secondary"
                            className="mt-5 w-full text-sm"
                            disabled={busy === item.id}
                            onClick={() => deliverOne(item.id)}
                          >
                            {busy === item.id
                              ? "Salvando…"
                              : "Marcar como entregue"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {activeSlotItems.length > 0 && (
          <PaginationControls
            page={activePagination.page}
            totalPages={activePagination.pages}
            totalItems={activePagination.totalItems}
            pageSize={activePagination.pageSize}
            onPageChange={activePagination.setPage}
          />
        )}

        {deliveredSlotItems.length > 0 && (
          <section className="space-y-3 pt-2">
            <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-muted">
              Já entregues
            </h3>
            <ul className="space-y-2">
              {deliveredPagination.visible.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-border/50 bg-neutral-50/80 px-5 py-4 opacity-90"
                >
                  <div className="space-y-3">
                    <div className="flex justify-end">{statusBadge(item.status)}</div>
                    <ItemDestinoDetail item={item} />
                  </div>
                </li>
              ))}
            </ul>
            <PaginationControls
              className="pt-2"
              page={deliveredPagination.page}
              totalPages={deliveredPagination.pages}
              totalItems={deliveredPagination.totalItems}
              pageSize={deliveredPagination.pageSize}
              onPageChange={deliveredPagination.setPage}
            />
          </section>
        )}

        {inRouteInSlot.length > 0 && pendingInSlot.length === 0 && (
          <p className="text-center text-sm text-muted">
            Entregue os itens em rota na ordem acima.
          </p>
        )}
      </div>
    );
  }

  const hasAnyForDay = dayItems.some((i) => isActiveItineraryStatus(i.status));

  return (
    <div className="space-y-6 pb-4">
      <Card padding="lg" className="border border-border/80">
        <label
          htmlFor="itinerary-date-filter"
          className="block text-sm font-bold text-foreground"
        >
          Data do itinerário
        </label>
        <input
          id="itinerary-date-filter"
          type="date"
          value={selectedDay}
          onChange={(e) => {
            if (e.target.value) setSelectedDay(e.target.value);
          }}
          className="input-field mt-3 w-full max-w-xs text-base"
        />
        {dayKeys.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Datas com entregas
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dayKeys.map((key) => {
                const active = key === selectedDay;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDay(key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-foreground hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    {formatItineraryDateShort(key)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {!hasAnyForDay && dayItems.length === 0 ? (
        <EmptyState
          title="Sem entregas neste dia"
          description="Não há compras para entrega nesta data."
          icon={<PackageCheck className="h-7 w-7" strokeWidth={1.75} />}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {slotsPagination.visible.map((slot) => {
            const counts = countsBySlot.get(slot.id) ?? { active: 0, total: 0 };
            const hasPending = counts.active > 0;
            return (
              <li key={slot.id}>
                <button
                  type="button"
                  onClick={() => openSlot(slot.id)}
                  className="w-full text-left"
                >
                  <Card
                    padding="lg"
                    className={`flex items-center justify-between gap-4 border transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      hasPending
                        ? "border-primary/30 bg-gradient-to-r from-primary-soft/40 to-card"
                        : "border-border/70 opacity-95"
                    }`}
                  >
                    <div className="min-w-0">
                      <DeliveryTime horario={slot.horario} className="text-sm" />
                      <p className="mt-3 text-sm font-medium text-muted">
                        {hasPending
                          ? `${counts.active} para entregar`
                          : counts.total > 0
                            ? "Tudo entregue"
                            : "Nenhuma compra"}
                        {counts.total > 0 && hasPending
                          ? ` · ${counts.total} no total`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        hasPending ? "bg-primary text-white" : "bg-neutral-100"
                      }`}
                    >
                      <ChevronRight
                        className={`h-5 w-5 ${hasPending ? "text-white" : "text-muted"}`}
                        aria-hidden
                      />
                    </span>
                  </Card>
                </button>
              </li>
            );
          })}
          </ul>
          <PaginationControls
            page={slotsPagination.page}
            totalPages={slotsPagination.pages}
            totalItems={slotsPagination.totalItems}
            pageSize={slotsPagination.pageSize}
            onPageChange={slotsPagination.setPage}
          />
        </>
      )}
    </div>
  );
}
