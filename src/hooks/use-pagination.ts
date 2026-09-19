"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clampPage,
  paginateSlice,
  totalPages as computeTotalPages,
} from "@/lib/pagination";

export function usePagination(
  itemCount: number,
  pageSize: number,
  resetKey?: string | number,
) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const pages = computeTotalPages(itemCount, pageSize);

  useEffect(() => {
    setPage((current) => clampPage(current, itemCount, pageSize));
  }, [itemCount, pageSize]);

  return { page, setPage, pages };
}

export function usePaginatedItems<T>(
  items: T[],
  pageSize: number,
  resetKey?: string | number,
) {
  const { page, setPage, pages } = usePagination(
    items.length,
    pageSize,
    resetKey,
  );

  const visible = useMemo(
    () => paginateSlice(items, page, pageSize),
    [items, page, pageSize],
  );

  return {
    visible,
    page,
    setPage,
    pages,
    totalItems: items.length,
    pageSize,
  };
}
