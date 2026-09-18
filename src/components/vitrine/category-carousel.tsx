"use client";

import Link from "next/link";
import type { CatalogCategory, CatalogCategoryId } from "@/lib/catalog-helpers";
import { CategoryIcon } from "@/components/vitrine/category-icon";

const CHIP_CLASS =
  "flex h-[6.75rem] w-[8.75rem] shrink-0 snap-start flex-col rounded-2xl border px-3 py-3 transition-colors duration-200";

export function CategoryCarousel({
  categories,
  activeId,
  onSelect,
  linkMode,
}: {
  categories: CatalogCategory[];
  activeId?: string;
  onSelect?: (id: string) => void;
  linkMode?: boolean;
}) {
  return (
    <div className="carousel-track flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
      {categories.map((cat) => {
        const active = activeId === cat.id;
        const className = `${CHIP_CLASS} ${
          active
            ? "border-primary bg-primary text-white shadow-sm"
            : "border-border bg-card text-foreground"
        }`;

        if (linkMode) {
          const href = cat.id === "all" ? "/loja" : `/loja?cat=${cat.id}`;
          return (
            <Link key={cat.id} href={href} className={className}>
              <CategoryCardContent cat={cat} inverted={active} />
            </Link>
          );
        }

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.id)}
            className={`text-left ${className}`}
          >
            <CategoryCardContent cat={cat} inverted={active} />
          </button>
        );
      })}
    </div>
  );
}

function CategoryCardContent({
  cat,
  inverted,
}: {
  cat: CatalogCategory;
  inverted?: boolean;
}) {
  return (
    <>
      <CategoryIcon categoryId={cat.id} inverted={inverted} />
      <p className="mt-2 font-display text-sm font-bold leading-tight">{cat.label}</p>
      <p
        className={`mt-1 line-clamp-2 text-[11px] leading-snug ${
          inverted ? "text-white/85" : "text-muted"
        }`}
      >
        {cat.description}
      </p>
    </>
  );
}

export function HomeCategoryStrip({
  categories,
}: {
  categories: CatalogCategory[];
}) {
  const items = categories.filter((c) => c.id !== "all");
  return (
    <div className="carousel-track flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
      {items.map((cat) => (
        <Link
          key={cat.id}
          href={`/loja?cat=${cat.id}`}
          className={`${CHIP_CLASS} border-border bg-card shadow-sm`}
        >
          <CategoryIcon categoryId={cat.id as CatalogCategoryId} />
          <p className="mt-2 font-display text-sm font-bold leading-tight text-foreground">
            {cat.label}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">
            {cat.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
