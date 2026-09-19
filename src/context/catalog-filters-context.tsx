"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CatalogCategoryId,
  CatalogPriceRangeId,
  CatalogSortId,
} from "@/lib/catalog-helpers";

type CatalogFiltersState = {
  query: string;
  setQuery: (value: string) => void;
  category: CatalogCategoryId;
  setCategory: (value: CatalogCategoryId) => void;
  onlyWithDiscount: boolean;
  setOnlyWithDiscount: (value: boolean) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (value: boolean) => void;
  onlyBestSellers: boolean;
  setOnlyBestSellers: (value: boolean) => void;
  priceRange: CatalogPriceRangeId;
  setPriceRange: (value: CatalogPriceRangeId) => void;
  sort: CatalogSortId;
  setSort: (value: CatalogSortId) => void;
  resetFilters: () => void;
};

const CatalogFiltersContext = createContext<CatalogFiltersState | null>(null);

export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategoryId>("all");
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);
  const [priceRange, setPriceRange] = useState<CatalogPriceRangeId>("all");
  const [sort, setSort] = useState<CatalogSortId>("default");

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
    setOnlyWithDiscount(false);
    setOnlyAvailable(false);
    setOnlyBestSellers(false);
    setPriceRange("all");
    setSort("default");
  }, []);

  const value = useMemo(
    () => ({
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
      resetFilters,
    }),
    [
      query,
      category,
      onlyWithDiscount,
      onlyAvailable,
      onlyBestSellers,
      priceRange,
      sort,
      resetFilters,
    ],
  );

  return (
    <CatalogFiltersContext.Provider value={value}>
      {children}
    </CatalogFiltersContext.Provider>
  );
}

export function useCatalogFilters(): CatalogFiltersState {
  const ctx = useContext(CatalogFiltersContext);
  if (!ctx) {
    throw new Error("useCatalogFilters must be used within CatalogFiltersProvider");
  }
  return ctx;
}

export function useOptionalCatalogFilters(): CatalogFiltersState | null {
  return useContext(CatalogFiltersContext);
}
