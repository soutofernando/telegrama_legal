"use client";

import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteDeliverySlot,
  saveDeliverySlotCrud,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import type { DeliverySlot } from "@/types/database";

export function SlotsManager({
  slots,
  pendingBySlot,
}: {
  slots: DeliverySlot[];
  pendingBySlot: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ horario: "", sort_order: "" });
  const [deleteTarget, setDeleteTarget] = useState<DeliverySlot | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(slots, LIST_PAGE_SIZE);

  const startNew = () => {
    setEditing("new");
    setForm({ horario: "", sort_order: String(slots.length + 1) });
  };

  const startEdit = (slot: DeliverySlot) => {
    setEditing(slot.id);
    setForm({
      horario: slot.horario,
      sort_order: String(slot.sort_order),
    });
  };

  const save = () => {
    startTransition(async () => {
      await saveDeliverySlotCrud(editing === "new" ? null : editing, form);
      setEditing(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Linha do tempo das entregas por horário.
        </p>
        <Button variant="secondary" onClick={startNew}>
          Novo horário
        </Button>
      </div>

      {slots.length === 0 ? (
        <EmptyState
          title="Sem horários cadastrados"
          description="Defina as janelas de entrega do encontro."
          icon={<Clock className="h-7 w-7" strokeWidth={1.75} />}
          action={
            <Button variant="primary" onClick={startNew}>
              Adicionar horário
            </Button>
          }
        />
      ) : (
        <div className="relative space-y-0 pl-6">
          <div
            className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-primary/15"
            aria-hidden
          />
          {visible.map((slot) => {
            const count = pendingBySlot[slot.id] ?? 0;
            return (
              <div key={slot.id} className="relative pb-6">
                <span
                  className="absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                  aria-hidden
                >
                  •
                </span>
                <Card className="border border-border/80" padding="sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {slot.horario}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Ordem {slot.sort_order}
                      </p>
                    </div>
                    {count > 0 && (
                      <Badge variant="warning">{count} pendente{count > 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(slot)}
                      className="min-h-10 rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(slot);
                      }}
                      className="min-h-10 rounded-xl px-4 text-sm font-semibold text-accent"
                    >
                      Remover
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {slots.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={pages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {(editing === "new" || editing) && (
        <Card className="border border-primary/20">
          <p className="mb-3 font-semibold text-foreground">
            {editing === "new" ? "Novo horário" : "Editar horário"}
          </p>
          <div className="space-y-3">
            <input
              placeholder="Ex: 13h"
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              className="input-field text-base"
            />
            <input
              type="number"
              placeholder="Ordem"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: e.target.value })
              }
              className="input-field text-base"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={pending || !form.horario}
              onClick={save}
            >
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover horário?"
        description={
          deleteTarget
            ? `O horário “${deleteTarget.horario}” será excluído permanentemente.`
            : ""
        }
        error={deleteError}
        pending={pending}
        onCancel={() => {
          if (pending) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const result = await deleteDeliverySlot(deleteTarget.id);
            if (!result.success) {
              setDeleteError(result.error);
              return;
            }
            setDeleteTarget(null);
            setDeleteError(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
