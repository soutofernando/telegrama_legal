"use client";

import { SlidersHorizontal } from "lucide-react";
import type { CatalogSortId } from "@/lib/catalog-helpers";

const FILTER_CHIP =
  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors";

const SORT_OPTIONS: { id: CatalogSortId; label: string }[] = [
  { id: "default", label: "Relevância" },
  { id: "bestsellers", label: "Mais vendidos" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
];

export function CatalogProductFilters({
  onlyWithDiscount,
  onOnlyWithDiscountChange,
  sort,
  onSortChange,
  resultCount,
}: {
  onlyWithDiscount: boolean;
  onOnlyWithDiscountChange: (value: boolean) => void;
  sort: CatalogSortId;
  onSortChange: (value: CatalogSortId) => void;
  resultCount: number;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-border bg-card/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden />
          Filtrar produtos
        </p>
        <p className="text-xs text-muted">
          {resultCount}{" "}
          {resultCount === 1 ? "item" : "itens"}
        </p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={onlyWithDiscount}
          onClick={() => onOnlyWithDiscountChange(!onlyWithDiscount)}
          className={`${FILTER_CHIP} ${
            onlyWithDiscount
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-soft"
          }`}
        >
          Com desconto
        </button>

        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex-none"
          role="group"
          aria-label="Ordenar por preço"
        >
          <span className="text-xs font-medium text-muted">Ordenar:</span>
          <div className="carousel-track flex gap-1.5 overflow-x-auto pb-0.5">
            {SORT_OPTIONS.map((option) => {
              const active = sort === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSortChange(option.id)}
                  className={`${FILTER_CHIP} ${
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/30"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
