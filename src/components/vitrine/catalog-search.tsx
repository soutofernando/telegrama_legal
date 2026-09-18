"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import type { BestSellerItem } from "@/lib/data/best-sellers";

const POLL_MS = 30 * 60 * 1000;
const PLACEHOLDER_ROTATE_MS = 4000;

export function CatalogSearch({
  query,
  onQueryChange,
  initialBestSellers,
  showBestSellers = true,
  className,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  initialBestSellers: BestSellerItem[];
  showBestSellers?: boolean;
  className?: string;
}) {
  const [bestSellers, setBestSellers] = useState(initialBestSellers);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const refreshBestSellers = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog/best-sellers");
      if (!res.ok) return;
      const data = (await res.json()) as { items: BestSellerItem[] };
      if (data.items?.length) setBestSellers(data.items);
    } catch {
      /* keep previous */
    }
  }, []);

  useEffect(() => {
    const poll = window.setInterval(refreshBestSellers, POLL_MS);
    return () => window.clearInterval(poll);
  }, [refreshBestSellers]);

  useEffect(() => {
    if (!bestSellers.length || query) return;
    const rotate = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % bestSellers.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => window.clearInterval(rotate);
  }, [bestSellers.length, query]);

  const rotatingPlaceholder =
    bestSellers.length > 0
      ? `Buscar… ex.: ${bestSellers[placeholderIndex]?.nome}`
      : "Buscar no catálogo…";

  return (
    <div className={`space-y-2.5 ${className ?? ""}`}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 z-10 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-muted"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={query ? "Buscar no catálogo…" : rotatingPlaceholder}
          className="input-field input-search"
          enterKeyHint="search"
          aria-label="Buscar no catálogo"
        />
      </div>

      {showBestSellers && bestSellers.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden />
            Mais vendidos
          </p>
          <div className="carousel-track flex gap-2 overflow-x-auto pb-0.5">
            {bestSellers.map((item) => (
              <Link
                key={item.productId}
                href={`/loja/${item.productId}`}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft"
              >
                {item.nome}
                {item.sold > 0 && (
                  <span className="ml-1 font-normal text-muted">({item.sold})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
