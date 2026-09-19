"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import {
  setOrderItemStatus,
  setOrderItemsStatus,
} from "@/app/actions/admin";
import { ItemDestinoDetail } from "@/components/admin/item-destino-detail";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { DeliveryTime } from "@/components/ui/delivery-time";
import { formatCurrency } from "@/lib/format";
import { FULFILLMENT_LABELS } from "@/lib/fulfillment";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-labels";
import type { DeliveryStatus, OrderItemWithRelations } from "@/types/database";

const STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: "pending", label: "Aguardando pagamento" },
  { value: "in_progress", label: "Em andamento" },
  { value: "delivered", label: "Entregue" },
];

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: STATUS_OPTIONS[0].label,
  in_progress: STATUS_OPTIONS[1].label,
  delivered: STATUS_OPTIONS[2].label,
};

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/50 py-3 last:border-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="text-sm font-semibold text-foreground">{children}</div>
    </div>
  );
}

function OrderItemDetailBody({
  item,
  onItemUpdated,
}: {
  item: OrderItemWithRelations;
  onItemUpdated?: (item: OrderItemWithRelations) => void;
}) {
  const payment = item.orders?.forma_pagamento;
  const buyer = item.orders?.nome_comprador?.trim();
  const [status, setStatus] = useState<DeliveryStatus>(item.status);
  const [carrierName, setCarrierName] = useState(item.entregador_nome ?? "");
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  useEffect(() => {
    setStatus(item.status);
    setCarrierName(item.entregador_nome ?? "");
    setActionError(null);
  }, [item.id, item.status, item.entregador_nome]);

  const statusDirty =
    status !== item.status ||
    (status === "in_progress" &&
      carrierName.trim() !== (item.entregador_nome ?? "").trim());

  const saveStatus = () => {
    setActionError(null);
    if (status === "in_progress" && !carrierName.trim()) {
      setActionError("Informe quem está na rota para colocar em andamento.");
      return;
    }

    startSave(async () => {
      try {
        if (status === "in_progress") {
          await setOrderItemsStatus(
            [item.id],
            "in_progress",
            carrierName.trim(),
          );
        } else {
          await setOrderItemStatus(item.id, status);
        }
        const updated: OrderItemWithRelations = {
          ...item,
          status,
          entregador_nome:
            status === "in_progress"
              ? carrierName.trim()
              : item.entregador_nome,
        };
        onItemUpdated?.(updated);
      } catch {
        setActionError("Não foi possível atualizar o status. Tente de novo.");
      }
    });
  };

  return (
    <div className="max-h-[min(70vh,32rem)] overflow-y-auto pb-2">
      <div className="mb-4">
        <Badge
          variant={
            item.status === "delivered"
              ? "success"
              : item.status === "in_progress"
                ? "secondary"
                : "accent"
          }
        >
          {STATUS_LABELS[item.status]}
        </Badge>
      </div>

      <section className="mb-4 rounded-2xl border border-border/70 bg-background p-4">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Status do pedido
          </span>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as DeliveryStatus)
            }
            className="input-field mt-2 w-full text-base"
            disabled={saving}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {status === "in_progress" && (
          <label className="mt-3 block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
              Quem está na rota
            </span>
            <input
              type="text"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              placeholder="Nome de quem leva o item"
              className="input-field mt-2 w-full text-base"
              autoComplete="name"
              disabled={saving}
            />
          </label>
        )}
        {actionError && (
          <p className="mt-3 text-sm font-medium text-accent" role="alert">
            {actionError}
          </p>
        )}
        <Button
          variant="primary"
          className="mt-4 w-full"
          disabled={saving || !statusDirty}
          onClick={saveStatus}
        >
          {saving ? "Salvando…" : "Salvar status"}
        </Button>
      </section>

      <ItemDestinoDetail item={item} />

      <div className="mt-4 rounded-2xl border border-border/70 bg-background px-4">
        {buyer && (
          <DetailRow label="Comprador">{buyer}</DetailRow>
        )}
        {payment && (
          <DetailRow label="Pagamento">
            {PAYMENT_METHOD_LABELS[payment]}
          </DetailRow>
        )}
        <DetailRow label={item.fulfillment_type === "pickup" ? "Retirada" : "Entrega"}>
          <span className="inline-flex flex-wrap items-center gap-2">
            {FULFILLMENT_LABELS[item.fulfillment_type ?? "delivery"]}
            <DeliveryTime horario={item.delivery_slots?.horario} />
          </span>
        </DetailRow>
        {item.entregador_nome && (
          <DetailRow label="Na rota com">{item.entregador_nome}</DetailRow>
        )}
        {item.valor_linha != null && (
          <DetailRow label="Valor do item">
            {formatCurrency(Number(item.valor_linha))}
          </DetailRow>
        )}
      </div>
    </div>
  );
}

function DesktopDetailDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] hidden md:block" role="presentation">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-item-dialog-title"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2
            id="order-item-dialog-title"
            className="text-lg font-bold text-foreground"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-xl text-sm font-semibold text-primary"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function OrderItemDetailOverlay({
  item,
  onClose,
  onItemUpdated,
}: {
  item: OrderItemWithRelations | null;
  onClose: () => void;
  onItemUpdated?: (item: OrderItemWithRelations) => void;
}) {
  const open = item != null;
  const title = "Detalhes do item";

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={title}>
        {item && (
          <OrderItemDetailBody item={item} onItemUpdated={onItemUpdated} />
        )}
      </BottomSheet>
      <DesktopDetailDialog open={open} onClose={onClose} title={title}>
        {item && (
          <OrderItemDetailBody item={item} onItemUpdated={onItemUpdated} />
        )}
      </DesktopDetailDialog>
    </>
  );
}
