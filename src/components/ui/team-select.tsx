"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Team } from "@/types/database";

const EMPTY_VALUE = "";
const EMPTY_LABEL = "Não sei / não se aplica";

function TeamOptionList({
  teams,
  value,
  onPick,
  allowEmpty,
}: {
  teams: Team[];
  value: string;
  onPick: (teamId: string) => void;
  allowEmpty: boolean;
}) {
  return (
    <ul
      className="-mx-1 max-h-[min(70vh,22rem)] divide-y divide-border/60 overflow-y-auto overscroll-contain"
      role="listbox"
    >
      {allowEmpty && (
        <li>
          <button
            type="button"
            role="option"
            aria-selected={value === EMPTY_VALUE}
            className={`touch-target w-full px-2 py-3 text-left text-sm ${
              value === EMPTY_VALUE
                ? "bg-primary-soft font-semibold text-primary"
                : "font-medium text-foreground"
            }`}
            onClick={() => onPick(EMPTY_VALUE)}
          >
            {EMPTY_LABEL}
          </button>
        </li>
      )}
      {teams.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            role="option"
            aria-selected={value === t.id}
            className={`touch-target w-full px-2 py-3 text-left text-sm ${
              value === t.id
                ? "bg-primary-soft font-semibold text-primary"
                : "font-medium text-foreground"
            }`}
            onClick={() => onPick(t.id)}
          >
            {t.nome}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function TeamSelect({
  id,
  label,
  optional = false,
  teams,
  value,
  onChange,
  required = false,
}: {
  id?: string;
  label: string;
  optional?: boolean;
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const display =
    value === EMPTY_VALUE
      ? required
        ? "Selecione…"
        : EMPTY_LABEL
      : teams.find((t) => t.id === value)?.nome ?? EMPTY_LABEL;

  const pick = (teamId: string) => {
    onChange(teamId);
    setOpen(false);
  };

  const list = (
    <TeamOptionList
      teams={teams}
      value={value}
      onPick={pick}
      allowEmpty={!required}
    />
  );

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-neutral-700"
      >
        {label}
        {optional && (
          <span className="font-normal text-muted"> (opcional)</span>
        )}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className="input-field flex w-full items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{display}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
      >
        {list}
      </BottomSheet>

      <DesktopTeamDialog
        open={open}
        title={label}
        onClose={() => setOpen(false)}
      >
        {list}
      </DesktopTeamDialog>
    </div>
  );
}

function DesktopTeamDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
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
        className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-dialog-title"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="team-dialog-title" className="text-lg font-bold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm font-semibold text-primary"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
