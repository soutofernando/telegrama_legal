"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertOrderItemManual } from "@/app/actions/admin";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";

export function ManualItemForm({
  teams,
  slots,
  products,
}: {
  teams: { id: string; nome: string }[];
  slots: { id: string; horario: string }[];
  products: { id: string; nome: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome_recebedor: "",
    equipe_destino_id: "",
    delivery_slot_id: "",
    product_id: "",
    quantidade: "1",
  });

  const submit = () => {
    startTransition(async () => {
      await upsertOrderItemManual({
        nome_recebedor: form.nome_recebedor,
        equipe_destino_id: form.equipe_destino_id,
        delivery_slot_id: form.delivery_slot_id,
        product_id: form.product_id,
        quantidade: Number(form.quantidade),
        status: "pending",
      });
      setOpen(false);
      setForm({
        nome_recebedor: "",
        equipe_destino_id: "",
        delivery_slot_id: "",
        product_id: "",
        quantidade: "1",
      });
      router.refresh();
    });
  };

  const valid =
    form.nome_recebedor &&
    form.equipe_destino_id &&
    form.delivery_slot_id &&
    form.product_id;

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)} className="text-sm px-3">
        + Nova
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar prenda"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Para quem vai a prenda
            </label>
            <input
              value={form.nome_recebedor}
              onChange={(e) =>
                setForm({ ...form, nome_recebedor: e.target.value })
              }
              className="input-field text-base"
              placeholder="Nome"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Equipe da pessoa
            </label>
            <select
              value={form.equipe_destino_id}
              onChange={(e) =>
                setForm({ ...form, equipe_destino_id: e.target.value })
              }
              className="input-field text-base"
            >
              <option value="">Selecione</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Horário</label>
            <select
              value={form.delivery_slot_id}
              onChange={(e) =>
                setForm({ ...form, delivery_slot_id: e.target.value })
              }
              className="input-field text-base"
            >
              <option value="">Selecione</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>{s.horario}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Produto</label>
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              className="input-field text-base"
            >
              <option value="">Selecione</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Quantidade</label>
            <input
              type="number"
              min={1}
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className="input-field text-base"
            />
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={pending || !valid}
            onClick={submit}
          >
            {pending ? "Salvando…" : "Salvar prenda"}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
