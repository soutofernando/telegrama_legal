"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CatalogCategoryId, CatalogSortId } from "@/lib/catalog-helpers";

type CatalogFiltersState = {
  query: string;
  setQuery: (value: string) => void;
  category: CatalogCategoryId;
  setCategory: (value: CatalogCategoryId) => void;
  onlyWithDiscount: boolean;
  setOnlyWithDiscount: (value: boolean) => void;
  sort: CatalogSortId;
  setSort: (value: CatalogSortId) => void;
  resetFilters: () => void;
};

const CatalogFiltersContext = createContext<CatalogFiltersState | null>(null);

export function CatalogFiltersProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategoryId>("all");
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [sort, setSort] = useState<CatalogSortId>("default");

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
    setOnlyWithDiscount(false);
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
      sort,
      setSort,
      resetFilters,
    }),
    [
      query,
      category,
      onlyWithDiscount,
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
