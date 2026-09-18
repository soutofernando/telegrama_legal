"use client";

import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export function QuantitySelector({
  value,
  min = 1,
  max,
  disabled,
  onChange,
  compact,
}: {
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);

  const bump = () => {
    if (prefersReducedMotion() || !valueRef.current) return;
    void import("gsap").then((gsap) => {
      gsap.default.fromTo(
        valueRef.current,
        { scale: 1.2, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2)" },
      );
    });
  };

  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (clamped !== value) {
      onChange(clamped);
      bump();
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border border-border bg-card shadow-sm ${
        compact ? "h-11 px-1" : "h-12 px-1.5"
      }`}
    >
      <button
        type="button"
        className="touch-target flex h-10 w-10 items-center justify-center rounded-xl text-lg text-foreground/70 transition-transform active:scale-90 disabled:opacity-35"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span
        ref={valueRef}
        className="min-w-10 text-center text-base font-bold tabular-nums text-foreground"
      >
        {value}
      </span>
      <button
        type="button"
        className="touch-target flex h-10 w-10 items-center justify-center rounded-xl text-lg text-foreground/70 transition-transform active:scale-90 disabled:opacity-35"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
