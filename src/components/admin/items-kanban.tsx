"use client";

import { CalendarClock, Check, Gift } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeliveryTime } from "@/components/ui/delivery-time";
import { formatDateTime } from "@/lib/format";
import { FULFILLMENT_LABELS } from "@/lib/fulfillment";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { KANBAN_PAGE_SIZE } from "@/lib/pagination";
import { ItemDestinoLabel } from "@/components/admin/item-destino-label";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import { OrderItemDetailOverlay } from "@/components/admin/order-item-detail-overlay";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  PRODUCT_KIND_LABELS,
  PRODUCT_KINDS,
} from "@/lib/product-kind";
import type {
  DeliveryStatus,
  OrderItemWithRelations,
  ProductKind,
} from "@/types/database";

const columns: {
  id: DeliveryStatus;
  title: string;
  dot: string;
  columnBg: string;
  badge: "accent" | "secondary" | "success";
}[] = [
  {
    id: "pending",
    title: "Aguardando pagamento",
    dot: "bg-accent",
    columnBg: "bg-accent-soft/40",
    badge: "accent",
  },
  {
    id: "in_progress",
    title: "Em andamento",
    dot: "bg-secondary",
    columnBg: "bg-secondary-soft/60",
    badge: "secondary",
  },
  {
    id: "delivered",
    title: "Entregue",
    dot: "bg-success",
    columnBg: "bg-success-soft/40",
    badge: "success",
  },
];

const STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: "pending", label: "Aguardando pagamento" },
  { value: "in_progress", label: "Em andamento" },
  { value: "delivered", label: "Entregue" },
];

function normalizeNameSearch(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function itemMatchesNameFilter(
  item: OrderItemWithRelations,
  query: string,
): boolean {
  const q = normalizeNameSearch(query);
  if (!q) return true;
  const haystack = [
    item.nome_recebedor,
    item.teams?.nome,
    item.products?.nome,
    item.entregador_nome,
  ]
    .filter(Boolean)
    .map((part) => normalizeNameSearch(part as string));
  return haystack.some((part) => part.includes(q));
}

function KanbanCard({
  item,
  onSelect,
}: {
  item: OrderItemWithRelations;
  onSelect: (item: OrderItemWithRelations) => void;
}) {
  const delivered = item.status === "delivered";

  return (
    <Card
      onClick={() => onSelect(item)}
      className={`w-full border border-border/80 text-left ${delivered ? "opacity-80" : ""}`}
      padding="sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <ItemDestinoLabel
            item={item}
            className={`text-base font-bold leading-snug ${delivered ? "text-muted line-through decoration-success/50" : "text-foreground"}`}
          />
        </div>
        {delivered && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
            aria-label="Entregue"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.products?.tipo && (
          <ProductKindBadge kind={item.products.tipo} />
        )}
        <p className="text-sm font-semibold text-foreground">
          {item.products?.nome ?? "—"}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>{item.quantidade} un.</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
          {FULFILLMENT_LABELS[item.fulfillment_type ?? "delivery"]}
        </span>
        <DeliveryTime horario={item.delivery_slots?.horario} />
        {item.status === "in_progress" && item.entregador_nome && (
          <span className="rounded-full bg-secondary-soft px-2 py-0.5 text-xs font-semibold text-foreground">
            Com {item.entregador_nome}
          </span>
        )}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted">
        <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Compra:{" "}
          <time dateTime={item.criado_em}>{formatDateTime(item.criado_em)}</time>
        </span>
      </p>
    </Card>
  );
}

function KanbanColumn({
  col,
  items,
  resetKey,
  onSelectItem,
}: {
  col: (typeof columns)[number];
  items: OrderItemWithRelations[];
  resetKey?: string | number;
  onSelectItem: (item: OrderItemWithRelations) => void;
}) {
  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(items, KANBAN_PAGE_SIZE, resetKey);

  return (
    <section
      className={`flex w-[min(88vw,20rem)] shrink-0 snap-center flex-col rounded-2xl p-3 md:w-auto ${col.columnBg}`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
        <h2 className="text-sm font-bold text-foreground">{col.title}</h2>
        <Badge variant={col.badge}>{items.length}</Badge>
      </header>
      <div className="flex flex-col gap-3">
        {visible.map((item) => (
          <KanbanCard key={item.id} item={item} onSelect={onSelectItem} />
        ))}
        {items.length === 0 && (
          <p className="rounded-xl bg-card/70 px-3 py-8 text-center text-sm text-muted">
            Nenhum item
          </p>
        )}
        <PaginationControls
          className="px-1 pt-1"
          page={page}
          totalPages={pages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}

export function ItemsKanban({
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
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
  const [kindFilter, setKindFilter] = useState<ProductKind | "">("");
  const [nameFilter, setNameFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<OrderItemWithRelations | null>(null);

  const filterKey = `${teamFilter}|${slotFilter}|${statusFilter}|${kindFilter}|${nameFilter}`;

  const activeFilterCount = [
    teamFilter,
    slotFilter,
    statusFilter,
    kindFilter,
    nameFilter.trim(),
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (teamFilter && item.equipe_destino_id !== teamFilter) return false;
      if (slotFilter && item.delivery_slot_id !== slotFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (kindFilter && item.products?.tipo !== kindFilter) return false;
      if (!itemMatchesNameFilter(item, nameFilter)) return false;
      return true;
    });
  }, [items, teamFilter, slotFilter, statusFilter, kindFilter, nameFilter]);

  const byColumn = useMemo(() => {
    const map: Record<DeliveryStatus, OrderItemWithRelations[]> = {
      pending: [],
      in_progress: [],
      delivered: [],
    };
    for (const item of filtered) {
      const status =
        item.status === "delivered" ||
        item.status === "in_progress" ||
        item.status === "pending"
          ? item.status
          : "pending";
      map[status].push(item);
    }
    return map;
  }, [filtered]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Vamos começar?"
        description="Nenhuma prenda registrada ainda. Use o botão acima para adicionar manualmente ou aguarde pedidos da loja."
        icon={<Gift className="h-7 w-7" strokeWidth={1.75} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Visão geral em tempo real. Para entregar, use o{" "}
        <span className="font-semibold text-foreground">Itinerário</span>.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Buscar por nome"
          className="input-field w-full min-h-11 text-sm md:max-w-[11rem]"
          aria-label="Buscar por nome"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] md:hidden"
        >
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="default">· {activeFilterCount}</Badge>
          )}
        </button>
        <div className="hidden flex-1 flex-wrap gap-2 md:flex">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="input-field max-w-[12rem] text-sm"
            aria-label="Filtrar por equipe"
          >
            <option value="">Todas as equipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="input-field max-w-[12rem] text-sm"
            aria-label="Filtrar por horário"
          >
            <option value="">Todos os horários</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>{s.horario}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DeliveryStatus | "")
            }
            className="input-field max-w-[12rem] text-sm"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={kindFilter}
            onChange={(e) =>
              setKindFilter(e.target.value as ProductKind | "")
            }
            className="input-field max-w-[12rem] text-sm"
            aria-label="Filtrar por tipo de prenda"
          >
            <option value="">Todos os tipos</option>
            {PRODUCT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {PRODUCT_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Nome
            </label>
            <input
              type="search"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Quem recebe, equipe ou produto"
              className="input-field text-base"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Equipe
            </label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="input-field text-base"
            >
              <option value="">Todas</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Horário
            </label>
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="input-field text-base"
            >
              <option value="">Todos</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>{s.horario}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Tipo
            </label>
            <select
              value={kindFilter}
              onChange={(e) =>
                setKindFilter(e.target.value as ProductKind | "")
              }
              className="input-field text-base"
            >
              <option value="">Todos</option>
              {PRODUCT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {PRODUCT_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Status
            </label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className={`min-h-11 rounded-xl px-4 text-left font-semibold ${!statusFilter ? "bg-primary-soft text-primary" : "bg-background"}`}
              >
                Todos
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatusFilter(s.value)}
                  className={`min-h-11 rounded-xl px-4 text-left font-semibold ${statusFilter === s.value ? "bg-primary-soft text-primary" : "bg-background"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setFiltersOpen(false)}
          >
            Aplicar
          </Button>
        </div>
      </BottomSheet>

      <div
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:snap-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            items={byColumn[col.id]}
            resetKey={filterKey}
            onSelectItem={setSelectedItem}
          />
        ))}
      </div>

      <OrderItemDetailOverlay
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
