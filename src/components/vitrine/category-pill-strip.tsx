"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setShowScrollHint(hasOverflow && !atEnd);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollHint();
    el.addEventListener("scroll", updateScrollHint, { passive: true });
    const ro = new ResizeObserver(updateScrollHint);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollHint);
      ro.disconnect();
    };
  }, [updateScrollHint, categories.length]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
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
      {showScrollHint && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background via-background/80 to-transparent"
            aria-hidden
          />
          <ChevronRight
            className="pointer-events-none absolute right-0.5 top-1/2 z-[2] h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </>
      )}
    </div>
  );
}
