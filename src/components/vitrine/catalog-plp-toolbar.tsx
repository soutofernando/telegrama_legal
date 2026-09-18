"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { CatalogSortId } from "@/lib/catalog-helpers";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const SORT_OPTIONS: { id: CatalogSortId; label: string }[] = [
  { id: "default", label: "Relevância" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
];

function sortLabel(sort: CatalogSortId) {
  return SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Relevância";
}

export function CatalogPlpToolbar({
  resultCount,
  onlyWithDiscount,
  onOnlyWithDiscountChange,
  sort,
  onSortChange,
}: {
  resultCount: number;
  onlyWithDiscount: boolean;
  onOnlyWithDiscountChange: (value: boolean) => void;
  sort: CatalogSortId;
  onSortChange: (value: CatalogSortId) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);
  const countLabel = `${resultCount} ${resultCount === 1 ? "produto" : "produtos"}`;
  const activeFilterCount = onlyWithDiscount ? 1 : 0;

  return (
    <>
      <div
        className="sticky top-[3.25rem] z-20 -mx-1 border-b border-border bg-background/95 px-1 py-2.5 backdrop-blur-sm md:top-[4.25rem]"
        aria-label="Ferramentas da listagem"
      >
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia("(min-width: 768px)").matches) {
                setDesktopFiltersOpen((v) => !v);
              } else {
                setFiltersOpen(true);
              }
            }}
            className="touch-target inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-expanded={desktopFiltersOpen || filtersOpen}
            aria-controls="catalog-plp-filters"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
            Filtrar
            {activeFilterCount > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white"
                aria-label={`${activeFilterCount} filtro ativo`}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="hidden flex-1 text-center text-sm font-medium text-muted md:block">
            {countLabel}
          </p>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <label
              className="touch-target flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground md:min-w-[11rem]"
              htmlFor="catalog-sort"
            >
              <span className="hidden text-muted md:inline">Ordenar:</span>
              <span className="md:hidden">Ordenar</span>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as CatalogSortId)}
                className="max-w-[8.5rem] flex-1 cursor-pointer border-0 bg-transparent py-0 pr-6 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Ordenar produtos"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none -ml-5 h-4 w-4 text-muted md:hidden"
                aria-hidden
              />
            </label>
          </div>
        </div>

        <p className="mt-2 text-center text-xs font-medium text-muted md:hidden">
          {countLabel}
        </p>

        {desktopFiltersOpen && (
          <div
            id="catalog-plp-filters"
            className="mt-3 hidden rounded-xl border border-border bg-card p-3 md:block"
          >
            <FilterOptions
              onlyWithDiscount={onlyWithDiscount}
              onOnlyWithDiscountChange={onOnlyWithDiscountChange}
              sort={sort}
              onSortChange={onSortChange}
              showSort={false}
            />
          </div>
        )}
      </div>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtrar produtos"
      >
        <FilterOptions
          onlyWithDiscount={onlyWithDiscount}
          onOnlyWithDiscountChange={onOnlyWithDiscountChange}
          sort={sort}
          onSortChange={onSortChange}
          showSort
        />
      </BottomSheet>
    </>
  );
}

function FilterOptions({
  onlyWithDiscount,
  onOnlyWithDiscountChange,
  sort,
  onSortChange,
  showSort,
}: {
  onlyWithDiscount: boolean;
  onOnlyWithDiscountChange: (value: boolean) => void;
  sort: CatalogSortId;
  onSortChange: (value: CatalogSortId) => void;
  showSort: boolean;
}) {
  const chip =
    "touch-target rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Promoções</p>
        <button
          type="button"
          aria-pressed={onlyWithDiscount}
          onClick={() => onOnlyWithDiscountChange(!onlyWithDiscount)}
          className={`${chip} mt-2 ${
            onlyWithDiscount
              ? "border-primary bg-primary text-white"
              : "border-border bg-background text-foreground"
          }`}
        >
          Apenas com desconto
        </button>
      </div>
      {showSort && (
        <div>
          <p className="text-sm font-semibold text-foreground">Ordenar por</p>
          <div className="mt-2 flex flex-col gap-2" role="radiogroup" aria-label="Ordenar">
            {SORT_OPTIONS.map((option) => {
              const active = sort === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onSortChange(option.id)}
                  className={`${chip} text-left ${
                    active
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { sortLabel };
