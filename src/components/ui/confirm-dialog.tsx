"use client";

import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  error,
  confirmLabel = "Remover",
  cancelLabel = "Cancelar",
  pending = false,
  hideConfirm = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  hideConfirm?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel, pending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={pending ? undefined : onCancel}
        disabled={pending}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-foreground"
        >
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="mt-2 text-sm text-muted">
          {description}
        </p>
        {error && (
          <p className="mt-3 text-sm font-semibold text-accent" role="alert">
            {error}
          </p>
        )}
        {children}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          {!hideConfirm && (
            <Button variant="danger" onClick={onConfirm} disabled={pending}>
              {pending ? "Aguarde…" : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
