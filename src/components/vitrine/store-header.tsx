"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useOptionalCatalogFilters } from "@/context/catalog-filters-context";
import { SITE_NAME } from "@/lib/constants";
import { CatalogSearch } from "@/components/vitrine/catalog-search";
import type { BestSellerItem } from "@/lib/data/best-sellers";
import { useEffect, useState } from "react";

const EMPTY_BEST_SELLERS: BestSellerItem[] = [];

export function StoreHeader() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const catalogFilters = useOptionalCatalogFilters();
  const hideOnProductMobile = /^\/loja\/[^/]+$/.test(pathname);
  const isCatalogList = pathname === "/loja";
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>(EMPTY_BEST_SELLERS);

  useEffect(() => {
    if (!isCatalogList) return;
    let cancelled = false;
    void fetch("/api/catalog/best-sellers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: BestSellerItem[] } | null) => {
        if (!cancelled && data?.items?.length) setBestSellers(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isCatalogList]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md ${
        hideOnProductMobile ? "hidden md:block" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 md:px-5">
        <div className="flex min-h-[3.25rem] items-center gap-3 md:min-h-[4.25rem] md:gap-4">
          <Link
            href="/"
            className="flex shrink-0 min-h-10 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image
              src="/ecri.jpg"
              alt="ECRI"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-contain shadow-sm"
              priority
            />
            <span className="font-display hidden text-sm font-bold leading-tight text-foreground sm:inline sm:text-base">
              {SITE_NAME}
            </span>
          </Link>

          {isCatalogList && catalogFilters && (
            <div className="hidden min-w-0 flex-1 md:block">
              <CatalogSearch
                query={catalogFilters.query}
                onQueryChange={catalogFilters.setQuery}
                initialBestSellers={bestSellers}
                showBestSellers={false}
              />
            </div>
          )}

          <nav
            className="ml-auto flex items-center gap-1 sm:gap-2"
            aria-label="Navegação principal"
          >
            <Link
              href="/loja"
              className={`touch-target hidden min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:inline-flex ${
                pathname.startsWith("/loja") ? "text-primary" : "text-muted"
              }`}
            >
              Catálogo
            </Link>
            <Link
              href="/atendimento"
              className={`touch-target hidden min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:inline-flex ${
                pathname.startsWith("/atendimento") ? "text-primary" : "text-muted"
              }`}
            >
              Atendimento
            </Link>
            <Link
              href="/carrinho"
              className="touch-target relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold transition-colors hover:border-primary/25 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4"
            >
              Carrinho
              {totalItems > 0 && (
                <span
                  data-cart-badge
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white"
                  aria-label={`${totalItems} itens no carrinho`}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
