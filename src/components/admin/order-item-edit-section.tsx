"use client";

import { useEffect, useState, useTransition } from "react";
import { updateOrderItemAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { OrderItemWithRelations, ProductKind } from "@/types/database";

type TeamOption = { id: string; nome: string };
type SlotOption = { id: string; horario: string };
type ProductOption = { id: string; nome: string; tipo?: ProductKind };

function buildUpdatedItem(
  item: OrderItemWithRelations,
  form: {
    nome_comprador: string;
    nome_recebedor: string;
    equipe_destino_id: string;
    delivery_slot_id: string;
    product_id: string;
    quantidade: string;
  },
  teams: TeamOption[],
  slots: SlotOption[],
  products: ProductOption[],
): OrderItemWithRelations {
  const team = teams.find((t) => t.id === form.equipe_destino_id);
  const slot = slots.find((s) => s.id === form.delivery_slot_id);
  const product = products.find((p) => p.id === form.product_id);
  const qty = Number(form.quantidade);

  return {
    ...item,
    nome_recebedor: form.nome_recebedor.trim(),
    equipe_destino_id: form.equipe_destino_id,
    delivery_slot_id: form.delivery_slot_id,
    product_id: form.product_id,
    quantidade: qty,
    teams: team ? { nome: team.nome } : item.teams,
    delivery_slots: slot
      ? { horario: slot.horario, sort_order: item.delivery_slots?.sort_order }
      : item.delivery_slots,
    products: product
      ? { nome: product.nome, tipo: product.tipo ?? item.products?.tipo }
      : item.products,
    orders: item.orders
      ? {
          ...item.orders,
          nome_comprador: form.nome_comprador.trim(),
        }
      : item.orders,
  };
}

export function OrderItemEditSection({
  item,
  teams,
  slots,
  products,
  onItemUpdated,
}: {
  item: OrderItemWithRelations;
  teams: TeamOption[];
  slots: SlotOption[];
  products: ProductOption[];
  onItemUpdated?: (item: OrderItemWithRelations) => void;
}) {
  const [form, setForm] = useState({
    nome_comprador: item.orders?.nome_comprador?.trim() ?? "",
    nome_recebedor: item.nome_recebedor,
    equipe_destino_id: item.equipe_destino_id,
    delivery_slot_id: item.delivery_slot_id,
    product_id: item.product_id,
    quantidade: String(item.quantidade),
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  useEffect(() => {
    setForm({
      nome_comprador: item.orders?.nome_comprador?.trim() ?? "",
      nome_recebedor: item.nome_recebedor,
      equipe_destino_id: item.equipe_destino_id,
      delivery_slot_id: item.delivery_slot_id,
      product_id: item.product_id,
      quantidade: String(item.quantidade),
    });
    setActionError(null);
  }, [
    item.id,
    item.nome_recebedor,
    item.equipe_destino_id,
    item.delivery_slot_id,
    item.product_id,
    item.quantidade,
    item.orders?.nome_comprador,
  ]);

  const qty = Number(form.quantidade);
  const serenataLocked = item.products?.tipo === "serenata";
  const dirty =
    form.nome_comprador.trim() !== (item.orders?.nome_comprador?.trim() ?? "") ||
    form.nome_recebedor.trim() !== item.nome_recebedor.trim() ||
    form.equipe_destino_id !== item.equipe_destino_id ||
    form.delivery_slot_id !== item.delivery_slot_id ||
    form.product_id !== item.product_id ||
    qty !== item.quantidade;

  const valid =
    form.nome_recebedor.trim() &&
    form.equipe_destino_id &&
    form.delivery_slot_id &&
    form.product_id &&
    Number.isFinite(qty) &&
    qty > 0;

  const save = () => {
    setActionError(null);
    if (!valid) {
      setActionError("Preencha todos os campos obrigatórios.");
      return;
    }

    startSave(async () => {
      try {
        await updateOrderItemAdmin({
          id: item.id,
          nome_comprador: form.nome_comprador.trim() || undefined,
          nome_recebedor: form.nome_recebedor,
          equipe_destino_id: form.equipe_destino_id,
          delivery_slot_id: form.delivery_slot_id,
          product_id: form.product_id,
          quantidade: qty,
        });
      } catch (e) {
        setActionError(
          e instanceof Error
            ? e.message
            : "Não foi possível salvar as alterações. Tente de novo.",
        );
        return;
      }

      onItemUpdated?.(buildUpdatedItem(item, form, teams, slots, products));
    });
  };

  return (
    <section className="mb-4 rounded-2xl border border-border/70 bg-background p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted">
        Editar pedido
      </h3>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Comprador</span>
          <input
            type="text"
            value={form.nome_comprador}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nome_comprador: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            autoComplete="name"
            disabled={saving}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Quem recebe</span>
          <input
            type="text"
            value={form.nome_recebedor}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nome_recebedor: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            autoComplete="name"
            disabled={saving}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Equipe destino</span>
          <select
            value={form.equipe_destino_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, equipe_destino_id: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            disabled={saving}
          >
            <option value="">Selecione</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Horário</span>
          <select
            value={form.delivery_slot_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, delivery_slot_id: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            disabled={saving}
          >
            <option value="">Selecione</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.horario}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Produto</span>
          <select
            value={form.product_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, product_id: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            disabled={saving || serenataLocked}
          >
            <option value="">Selecione</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          {serenataLocked && (
            <p className="mt-1 text-xs text-muted">
              Serenatas não permitem trocar o produto aqui.
            </p>
          )}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Quantidade</span>
          <input
            type="number"
            min={1}
            value={form.quantidade}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, quantidade: e.target.value }))
            }
            className="input-field mt-2 w-full text-base"
            disabled={saving}
          />
        </label>
      </div>
      {actionError && (
        <p className="mt-3 text-sm font-medium text-accent" role="alert">
          {actionError}
        </p>
      )}
      <Button
        variant="secondary"
        className="mt-4 w-full"
        disabled={saving || !dirty || !valid}
        onClick={save}
      >
        {saving ? "Salvando…" : "Salvar alterações"}
      </Button>
    </section>
  );
}
