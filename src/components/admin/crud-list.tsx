"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { AdminActionResult } from "@/lib/admin-action-result";

export function CrudList<T extends { id: string }>({
  items,
  renderLabel,
  onSave,
  onDelete,
  emptyLabel,
  fields,
}: {
  items: T[];
  renderLabel: (item: T) => string;
  emptyLabel: string;
  fields: {
    key: keyof T & string;
    label: string;
    type?: "text" | "number";
    placeholder?: string;
  }[];
  onSave: (
    id: string | null,
    values: Record<string, string>,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<AdminActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startNew = () => {
    setEditing("new");
    setForm({});
  };

  const startEdit = (item: T) => {
    setEditing(item.id);
    const next: Record<string, string> = {};
    for (const f of fields) {
      next[f.key] = String(item[f.key] ?? "");
    }
    setForm(next);
  };

  const submit = () => {
    startTransition(async () => {
      await onSave(editing === "new" ? null : editing, form);
      setEditing(null);
      setForm({});
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={startNew}
        className="btn-secondary min-h-11 px-4 text-sm"
      >
        Adicionar
      </button>

      {(editing === "new" || editing) && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs text-neutral-500">
                {f.label}
              </label>
              <input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-sm text-neutral-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {items.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-500">{emptyLabel}</li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span>{renderLabel(item)}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="text-neutral-600 hover:text-neutral-900"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setDeleteError(null);
                  setDeleteTarget(item);
                }}
                className="text-rose-600 hover:text-rose-800"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Confirmar remoção"
        description={
          deleteTarget
            ? `Remover “${renderLabel(deleteTarget)}” permanentemente?`
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
            const result = await onDelete(deleteTarget.id);
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
