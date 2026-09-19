"use client";

import { useMemo, useState } from "react";
import { TeamSelect } from "@/components/ui/team-select";
import { isGiftProductKind } from "@/lib/gift-product";
import {
  giftRecipientPrompt,
  lineRequiresRecipient,
  recipientSummary,
  type LineUnitRecipient,
} from "@/lib/checkout-recipients";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import type { CartLine, Team } from "@/types/database";

export function OrderItemsRecipients({
  items,
  teams,
  lineUnits,
  onChangeUnits,
}: {
  items: CartLine[];
  teams: Team[];
  lineUnits: Record<string, LineUnitRecipient[]>;
  onChangeUnits: (
    lineId: string,
    units: LineUnitRecipient[],
  ) => void;
}) {
  const [openLines, setOpenLines] = useState<Record<string, boolean>>({});

  const defaultOpen = useMemo(() => {
    const o: Record<string, boolean> = {};
    for (const line of items) {
      o[line.lineId] =
        isGiftProductKind(line.tipo) || line.quantidade <= 2;
    }
    return o;
  }, [items]);

  const isOpen = (lineId: string) =>
    openLines[lineId] ?? defaultOpen[lineId] ?? true;

  const toggleOpen = (lineId: string) => {
    setOpenLines((prev) => ({
      ...prev,
      [lineId]: !isOpen(lineId),
    }));
  };

  const patchUnit = (
    lineId: string,
    index: number,
    patch: Partial<LineUnitRecipient>,
  ) => {
    const units = [...(lineUnits[lineId] ?? [])];
    units[index] = { ...units[index], ...patch };
    onChangeUnits(lineId, units);
  };

  const setAllSelf = (line: CartLine) => {
    const units = (lineUnits[line.lineId] ?? []).map(() => ({
      mode: "self" as const,
      nomeRecebedor: "",
      equipeDestinoId: "",
    }));
    onChangeUnits(line.lineId, units);
    setOpenLines((prev) => ({ ...prev, [line.lineId]: true }));
  };

  const copyPrevious = (lineId: string, index: number) => {
    const units = lineUnits[lineId] ?? [];
    if (index < 1) return;
    const prev = units[index - 1];
    patchUnit(lineId, index, {
      mode: prev.mode,
      nomeRecebedor: prev.nomeRecebedor,
      equipeDestinoId: prev.equipeDestinoId,
    });
  };

  if (!items.length) return null;

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div>
        <p className="text-sm font-semibold text-neutral-900">
          Para quem vai cada item?
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Serenatas e prendas sempre vão para outra pessoa. Nos demais itens,
          escolha por unidade se é para você ou presente.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map((line) => {
          const units = lineUnits[line.lineId] ?? [];
          const gift = isGiftProductKind(line.tipo);
          const expanded = isOpen(line.lineId);
          const summary = recipientSummary(line, units);

          return (
            <li
              key={line.lineId}
              className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/60"
            >
              <button
                type="button"
                onClick={() => toggleOpen(line.lineId)}
                className="flex w-full items-start gap-3 p-3 text-left"
              >
                <span
                  className="mt-0.5 text-neutral-400"
                  aria-hidden
                >
                  {expanded ? "▾" : "▸"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">
                      {line.nome}
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200">
                      × {line.quantidade}
                    </span>
                    {line.tipo && <ProductKindBadge kind={line.tipo} />}
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {summary}
                  </span>
                </span>
              </button>

              {expanded && (
                <div className="space-y-3 border-t border-neutral-200/80 bg-white/80 px-3 pb-3 pt-3">
                  {!gift && line.quantidade > 1 && (
                    <button
                      type="button"
                      onClick={() => setAllSelf(line)}
                      className="text-xs font-semibold text-ecri-blue underline-offset-2 hover:underline"
                    >
                      Marcar todas as unidades para mim
                    </button>
                  )}

                  {units.map((unit, index) => (
                    <UnitRecipientBlock
                      key={`${line.lineId}-${index}`}
                      line={line}
                      index={index}
                      total={units.length}
                      unit={unit}
                      teams={teams}
                      showModeToggle={!gift}
                      onPatch={(patch) =>
                        patchUnit(line.lineId, index, patch)
                      }
                      onCopyPrevious={
                        index > 0 && !gift
                          ? () => copyPrevious(line.lineId, index)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UnitRecipientBlock({
  line,
  index,
  total,
  unit,
  teams,
  showModeToggle,
  onPatch,
  onCopyPrevious,
}: {
  line: CartLine;
  index: number;
  total: number;
  unit: LineUnitRecipient;
  teams: Team[];
  showModeToggle: boolean;
  onPatch: (patch: Partial<LineUnitRecipient>) => void;
  onCopyPrevious?: () => void;
}) {
  const needsDetails = lineRequiresRecipient(line, unit);
  const gift = isGiftProductKind(line.tipo);

  return (
    <div
      className={`rounded-xl border p-3 ${
        needsDetails && !unit.nomeRecebedor.trim()
          ? "border-ecri-blue/30 bg-ecri-blue/[0.03]"
          : "border-neutral-100 bg-neutral-50/50"
      }`}
    >
      {total > 1 && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Unidade {index + 1} de {total}
          </span>
          {onCopyPrevious && (
            <button
              type="button"
              onClick={onCopyPrevious}
              className="text-xs font-medium text-ecri-blue hover:underline"
            >
              Igual à anterior
            </button>
          )}
        </div>
      )}

      {showModeToggle && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(
            [
              { mode: "self" as const, label: "Para mim" },
              { mode: "other" as const, label: "Presente" },
            ] as const
          ).map(({ mode, label }) => {
            const active = unit.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  onPatch({
                    mode,
                    ...(mode === "self"
                      ? { nomeRecebedor: "", equipeDestinoId: "" }
                      : {}),
                  })
                }
                className={`min-h-10 rounded-xl border-2 px-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-ecri-blue bg-ecri-blue/5 text-neutral-900"
                    : "border-neutral-100 text-neutral-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {needsDetails && (
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              {gift
                ? giftRecipientPrompt(line.tipo)
                : "Nome de quem vai receber"}
            </label>
            <input
              required
              value={unit.nomeRecebedor}
              onChange={(e) =>
                onPatch({ nomeRecebedor: e.target.value })
              }
              className="input-field"
              placeholder="Nome"
              autoComplete="name"
            />
          </div>
          <TeamSelect
            label="Equipe da pessoa"
            teams={teams}
            value={unit.equipeDestinoId}
            onChange={(id) => onPatch({ equipeDestinoId: id })}
            required
          />
        </div>
      )}

      {!needsDetails && (
        <p className="text-sm text-neutral-600">
          Entregamos com os seus dados de comprador.
        </p>
      )}
    </div>
  );
}
