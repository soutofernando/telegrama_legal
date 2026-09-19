"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicProduct } from "@/types/database";
import type { BestSellerItem } from "@/lib/data/best-sellers";
import {
  buildBestSellerRankMap,
  buildCatalogOrderMap,
  CATALOG_CATEGORIES,
  type CatalogCategoryId,
  filterByAvailability,
  filterByBestSellers,
  filterByCategory,
  filterByPriceRange,
  filterByPromotion,
  filterBySearch,
  hasCatalogFiltersActive,
  pickFeaturedProduct,
  sortCatalogProducts,
} from "@/lib/catalog-helpers";
import { useCatalogFilters } from "@/context/catalog-filters-context";
import { CatalogPlpToolbar } from "@/components/vitrine/catalog-plp-toolbar";
import { CatalogSearch } from "@/components/vitrine/catalog-search";
import { CategoryPillStrip } from "@/components/vitrine/category-pill-strip";
import { ProductCard } from "@/components/vitrine/product-card";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";

function categoryTitle(categoryId: CatalogCategoryId): string {
  if (categoryId === "all") return "Todos os produtos";
  return CATALOG_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "Produtos";
}

export function CatalogExperience({
  products,
  initialCategory = "all",
  maxQuantities,
  bestSellers,
}: {
  products: PublicProduct[];
  initialCategory?: CatalogCategoryId;
  maxQuantities: Record<string, number>;
  bestSellers: BestSellerItem[];
}) {
  const {
    query,
    setQuery,
    category,
    setCategory,
    onlyWithDiscount,
    setOnlyWithDiscount,
    onlyAvailable,
    setOnlyAvailable,
    onlyBestSellers,
    setOnlyBestSellers,
    priceRange,
    setPriceRange,
    sort,
    setSort,
  } = useCatalogFilters();
  const router = useRouter();

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory, setCategory]);

  const catalogOrder = useMemo(
    () => buildCatalogOrderMap(products),
    [products],
  );

  const bestSellerIds = useMemo(
    () => new Set(bestSellers.map((b) => b.productId)),
    [bestSellers],
  );

  const bestSellerRank = useMemo(
    () => buildBestSellerRankMap(bestSellers.map((b) => b.productId)),
    [bestSellers],
  );

  const featured = useMemo(
    () => pickFeaturedProduct(products),
    [products],
  );

  const filtersActive = hasCatalogFiltersActive({
    query,
    category,
    onlyWithDiscount,
    onlyAvailable,
    onlyBestSellers,
    priceRange,
    sort,
  });

  const showFeaturedInGrid =
    Boolean(featured) &&
    !filtersActive &&
    category === "all" &&
    !query.trim();

  const filtered = useMemo(() => {
    let list = filterByCategory(products, category);
    list = filterBySearch(list, query);
    list = filterByPromotion(list, onlyWithDiscount);
    list = filterByAvailability(list, onlyAvailable);
    list = filterByBestSellers(list, onlyBestSellers, bestSellerIds);
    list = filterByPriceRange(list, priceRange);
    list = sortCatalogProducts(list, sort, {
      catalogOrder,
      bestSellerRank,
      featuredProductId: showFeaturedInGrid ? featured?.id ?? null : null,
    });
    if (showFeaturedInGrid && featured) {
      list = list.filter((p) => p.id !== featured.id);
    }
    return list;
  }, [
    products,
    category,
    query,
    onlyWithDiscount,
    onlyAvailable,
    onlyBestSellers,
    priceRange,
    sort,
    catalogOrder,
    bestSellerRank,
    featured,
    showFeaturedInGrid,
    bestSellerIds,
  ]);

  const pageTitle = categoryTitle(category);
  const queryHint = query.trim() ? ` para “${query.trim()}”` : "";

  return (
    <div className="pb-6">
      <div className={`mx-auto max-w-6xl ${VITRINE_GUTTER} pt-3 md:pt-4`}>
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-muted">
            <li>
              <Link
                href="/loja"
                className="font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Catálogo
              </Link>
            </li>
            {category !== "all" && (
              <>
                <li aria-hidden className="text-border">/</li>
                <li className="font-semibold text-foreground" aria-current="page">
                  {pageTitle}
                </li>
              </>
            )}
          </ol>
        </nav>

        <header className="mt-2">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground md:text-[1.75rem]">
            {pageTitle}
          </h1>
        </header>

        <div className="mt-4 md:hidden">
          <CatalogSearch
            query={query}
            onQueryChange={setQuery}
            initialBestSellers={bestSellers}
            showBestSellers={false}
          />
        </div>

        <div
          className="sticky top-[3.25rem] z-30 -mx-1 border-b border-border/60 bg-background/95 px-1 py-2.5 backdrop-blur-sm md:top-[4.25rem]"
        >
          <CategoryPillStrip
            categories={CATALOG_CATEGORIES}
            activeId={category}
            onSelect={(id) => {
              const next = id as CatalogCategoryId;
              setCategory(next);
              const href = next === "all" ? "/loja" : `/loja?cat=${next}`;
              router.replace(href, { scroll: false });
            }}
          />
        </div>

        <CatalogPlpToolbar
          resultCount={
            filtered.length + (showFeaturedInGrid && featured ? 1 : 0)
          }
          queryHint={queryHint}
          onlyWithDiscount={onlyWithDiscount}
          onOnlyWithDiscountChange={setOnlyWithDiscount}
          onlyAvailable={onlyAvailable}
          onOnlyAvailableChange={setOnlyAvailable}
          onlyBestSellers={onlyBestSellers}
          onOnlyBestSellersChange={setOnlyBestSellers}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sort={sort}
          onSortChange={setSort}
        />

        {filtered.length === 0 && !showFeaturedInGrid ? (
          <p className="mt-6 text-center text-muted" role="status">
            Nenhum produto encontrado. Tente outra categoria ou limpe os filtros.
          </p>
        ) : (
          <ul
            className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4"
            aria-label="Lista de produtos"
          >
            {showFeaturedInGrid && featured && (
              <li key={featured.id} className="flex">
                <ProductCard
                  product={featured}
                  variant="grid"
                  className="h-full w-full"
                  maxQuantity={maxQuantities[featured.id]}
                  featuredInGrid
                  highlightBadge={
                    bestSellerIds.has(featured.id) ? "bestseller" : undefined
                  }
                />
              </li>
            )}
            {filtered.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard
                  product={product}
                  variant="grid"
                  className="h-full w-full"
                  maxQuantity={maxQuantities[product.id]}
                  highlightBadge={
                    bestSellerIds.has(product.id) ? "bestseller" : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
