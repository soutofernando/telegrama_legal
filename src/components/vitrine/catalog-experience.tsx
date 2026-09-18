"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicProduct } from "@/types/database";
import type { BestSellerItem } from "@/lib/data/best-sellers";
import {
  CATALOG_CATEGORIES,
  type CatalogCategoryId,
  filterByCategory,
  filterByPromotion,
  filterBySearch,
  hasCatalogFiltersActive,
  pickFeaturedProduct,
  sortCatalogProducts,
} from "@/lib/catalog-helpers";
import { useCatalogFilters } from "@/context/catalog-filters-context";
import { CatalogPlpToolbar } from "@/components/vitrine/catalog-plp-toolbar";
import { CategoryPillStrip } from "@/components/vitrine/category-pill-strip";
import { CompactFeaturedProduct } from "@/components/vitrine/featured-product";
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
    sort,
    setSort,
  } = useCatalogFilters();
  const router = useRouter();

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory, setCategory]);

  const filtered = useMemo(() => {
    let list = filterByCategory(products, category);
    list = filterBySearch(list, query);
    list = filterByPromotion(list, onlyWithDiscount);
    list = sortCatalogProducts(list, sort);
    return list;
  }, [products, category, query, onlyWithDiscount, sort]);

  const filtersActive = hasCatalogFiltersActive({
    query,
    category,
    onlyWithDiscount,
    sort,
  });

  const featured = useMemo(
    () => (filtersActive ? null : pickFeaturedProduct(products)),
    [products, filtersActive],
  );

  const bestSellerIds = useMemo(
    () => new Set(bestSellers.map((b) => b.productId)),
    [bestSellers],
  );

  const pageTitle = categoryTitle(category);

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
          <p className="mt-0.5 text-sm font-medium text-muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "produto" : "produtos"}
            {query.trim() ? ` para “${query.trim()}”` : ""}
          </p>
        </header>

        <div className="mt-4 md:hidden">
          <label className="sr-only" htmlFor="catalog-mobile-search">
            Buscar no catálogo
          </label>
          <input
            id="catalog-mobile-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos…"
            className="input-field input-search w-full"
            enterKeyHint="search"
          />
        </div>

        <div className="mt-4">
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

        {featured && !filtersActive && (
          <div className="mt-4">
            <CompactFeaturedProduct
              product={featured}
              maxQuantity={maxQuantities[featured.id]}
            />
          </div>
        )}

        <CatalogPlpToolbar
          resultCount={filtered.length}
          onlyWithDiscount={onlyWithDiscount}
          onOnlyWithDiscountChange={setOnlyWithDiscount}
          sort={sort}
          onSortChange={setSort}
        />

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-muted" role="status">
            Nenhum produto encontrado. Tente outra categoria ou limpe os filtros.
          </p>
        ) : (
          <ul
            className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4"
            aria-label="Lista de produtos"
          >
            {filtered.map((product, index) => (
              <li key={product.id} className="flex">
                <ProductCard
                  product={product}
                  variant="grid"
                  className="h-full w-full"
                  maxQuantity={maxQuantities[product.id]}
                  highlightBadge={
                    bestSellerIds.has(product.id)
                      ? "bestseller"
                      : index < 2 && category === "all" && !filtersActive
                        ? "new"
                        : undefined
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
