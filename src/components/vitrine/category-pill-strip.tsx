"use client";

import type { CatalogCategory } from "@/lib/catalog-helpers";

const PILL =
  "touch-target shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function CategoryPillStrip({
  categories,
  activeId,
  onSelect,
}: {
  categories: CatalogCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="carousel-track -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-0.5"
      role="tablist"
      aria-label="Categorias do catálogo"
    >
      {categories.map((cat) => {
        const active = activeId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(cat.id)}
            className={`${PILL} ${
              active
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/35 hover:bg-primary-soft"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
