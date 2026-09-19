"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type {
  CatalogPriceRangeId,
  CatalogSortId,
} from "@/lib/catalog-helpers";
import { countCatalogPanelFilters } from "@/lib/catalog-helpers";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const SORT_OPTIONS: { id: CatalogSortId; label: string }[] = [
  { id: "default", label: "Relevância" },
  { id: "bestsellers", label: "Mais vendidos" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
];

const PRICE_RANGE_OPTIONS: { id: CatalogPriceRangeId; label: string }[] = [
  { id: "all", label: "Qualquer preço" },
  { id: "under-15", label: "Até R$ 15" },
  { id: "15-30", label: "R$ 15 a R$ 30" },
  { id: "over-30", label: "Acima de R$ 30" },
];

function sortLabel(sort: CatalogSortId) {
  return SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "Relevância";
}

export type CatalogPanelFilterProps = {
  onlyWithDiscount: boolean;
  onOnlyWithDiscountChange: (value: boolean) => void;
  onlyAvailable: boolean;
  onOnlyAvailableChange: (value: boolean) => void;
  onlyBestSellers: boolean;
  onOnlyBestSellersChange: (value: boolean) => void;
  priceRange: CatalogPriceRangeId;
  onPriceRangeChange: (value: CatalogPriceRangeId) => void;
};

export function CatalogPlpToolbar({
  resultCount,
  sort,
  onSortChange,
  queryHint,
  ...filterProps
}: CatalogPanelFilterProps & {
  resultCount: number;
  sort: CatalogSortId;
  onSortChange: (value: CatalogSortId) => void;
  queryHint?: string;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);

  const activeFilterCount = countCatalogPanelFilters({
    onlyWithDiscount: filterProps.onlyWithDiscount,
    onlyAvailable: filterProps.onlyAvailable,
    onlyBestSellers: filterProps.onlyBestSellers,
    priceRange: filterProps.priceRange,
  });

  const filterButtonLabel =
    activeFilterCount > 0 ? `Filtrar (${activeFilterCount})` : "Filtrar";

  const countLabel = `${resultCount} ${
    resultCount === 1 ? "produto" : "produtos"
  }${queryHint ?? ""}`;

  return (
    <>
      <div className="pt-3" aria-label="Ferramentas da listagem">
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
            {filterButtonLabel}
          </button>

          <p className="min-w-0 flex-1 text-sm font-medium text-muted">
            {countLabel}
          </p>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:ml-auto">
            <label
              className="touch-target flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground sm:w-auto md:min-w-[11rem]"
              htmlFor="catalog-sort"
            >
              <span className="shrink-0 text-muted">Ordenar:</span>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as CatalogSortId)}
                className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent py-0 pr-6 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Ordenar produtos"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none -ml-5 h-4 w-4 shrink-0 text-muted"
                aria-hidden
              />
            </label>
          </div>
        </div>

        {desktopFiltersOpen && (
          <div
            id="catalog-plp-filters"
            className="mt-3 hidden rounded-xl border border-border bg-card p-3 md:block"
          >
            <FilterOptions
              {...filterProps}
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
          {...filterProps}
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
  onlyAvailable,
  onOnlyAvailableChange,
  onlyBestSellers,
  onOnlyBestSellersChange,
  priceRange,
  onPriceRangeChange,
  sort,
  onSortChange,
  showSort,
}: CatalogPanelFilterProps & {
  sort: CatalogSortId;
  onSortChange: (value: CatalogSortId) => void;
  showSort: boolean;
}) {
  const chip =
    "touch-target rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Disponibilidade</p>
        <p className="mt-0.5 text-xs text-muted">
          Mostre só o que ainda pode ser comprado agora.
        </p>
        <button
          type="button"
          aria-pressed={onlyAvailable}
          onClick={() => onOnlyAvailableChange(!onlyAvailable)}
          className={`${chip} mt-2 ${
            onlyAvailable
              ? "border-primary bg-primary text-white"
              : "border-border bg-background text-foreground"
          }`}
        >
          Apenas disponíveis
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Promoções</p>
        <p className="mt-0.5 text-xs text-muted">
          Descontos e combos promocionais ativos.
        </p>
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

      <div>
        <p className="text-sm font-semibold text-foreground">Popularidade</p>
        <p className="mt-0.5 text-xs text-muted">
          Produtos com mais vendas no encontro.
        </p>
        <button
          type="button"
          aria-pressed={onlyBestSellers}
          onClick={() => onOnlyBestSellersChange(!onlyBestSellers)}
          className={`${chip} mt-2 ${
            onlyBestSellers
              ? "border-primary bg-primary text-white"
              : "border-border bg-background text-foreground"
          }`}
        >
          Mais vendidos
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">Faixa de preço</p>
        <p className="mt-0.5 text-xs text-muted">Filtre pelo valor unitário.</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Faixa de preço">
          {PRICE_RANGE_OPTIONS.map((option) => {
            const active = priceRange === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onPriceRangeChange(option.id)}
                className={`${chip} ${
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

      {showSort && (
        <div>
          <p className="text-sm font-semibold text-foreground">Ordenar por</p>
          <p className="mt-0.5 text-xs text-muted">
            Relevância prioriza destaque, vendas e promoções.
          </p>
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
