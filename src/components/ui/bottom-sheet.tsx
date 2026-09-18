"use client";

import { useEffect, type ReactNode } from "react";

export function BottomSheet({
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
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 animate-sheet-up rounded-t-3xl bg-card px-4 pt-4 shadow-2xl"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="sheet-title" className="text-lg font-bold text-foreground">
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
