"use client";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationControlsProps) {
  if (totalItems <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      aria-label="Paginação"
    >
      <p className="text-sm text-muted">
        {start}–{end} de {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="min-h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="min-w-[4.5rem] text-center text-sm font-medium text-muted">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="min-h-10 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}
