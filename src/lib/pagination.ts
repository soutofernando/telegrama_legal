export const DEFAULT_PAGE_SIZE = 12;
export const LIST_PAGE_SIZE = 15;
export const KANBAN_PAGE_SIZE = 10;

export function totalPages(itemCount: number, pageSize: number): number {
  if (itemCount <= 0) return 1;
  return Math.ceil(itemCount / pageSize);
}

export function paginateSlice<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  if (items.length === 0) return items;
  const pages = totalPages(items.length, pageSize);
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampPage(page: number, itemCount: number, pageSize: number) {
  return Math.min(Math.max(1, page), totalPages(itemCount, pageSize));
}
