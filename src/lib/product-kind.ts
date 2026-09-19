import type { CatalogCategoryId } from "@/lib/catalog-helpers";
import type { ProductKind } from "@/types/database";

export const PRODUCT_KINDS: ProductKind[] = [
  "botton",
  "serenata",
  "prenda",
  "adesivo",
  "tirante",
];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  botton: "Botton",
  serenata: "Serenata",
  prenda: "Prenda",
  adesivo: "Adesivo",
  tirante: "Tirante",
};

/** Soft filled badge (admin, vitrine, itinerário). */
export const PRODUCT_KIND_BADGE_CLASS: Record<ProductKind, string> = {
  botton: "bg-primary-soft text-primary",
  serenata: "bg-violet-100 text-violet-800",
  prenda: "bg-secondary-soft text-amber-950",
  adesivo: "bg-emerald-100 text-emerald-800",
  tirante: "bg-accent-soft text-accent",
};

export const PRODUCT_KIND_BADGE_OUTLINE_CLASS: Record<ProductKind, string> = {
  botton: "border border-primary/25 bg-white text-primary",
  serenata: "border border-violet-200 bg-white text-violet-800",
  prenda: "border border-amber-200 bg-white text-amber-900",
  adesivo: "border border-emerald-200 bg-white text-emerald-800",
  tirante: "border border-accent/30 bg-white text-accent",
};

const PRODUCT_KIND_BADGE_BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide";

export function productKindBadgeClassName(
  kind: ProductKind,
  variant: "filled" | "outline" = "filled",
): string {
  const color =
    variant === "outline"
      ? PRODUCT_KIND_BADGE_OUTLINE_CLASS[kind]
      : PRODUCT_KIND_BADGE_CLASS[kind];
  return `${PRODUCT_KIND_BADGE_BASE} ${color}`;
}

const KIND_TO_CATEGORY: Record<ProductKind, CatalogCategoryId> = {
  botton: "botoes",
  adesivo: "adesivos",
  serenata: "serenatas",
  prenda: "prendas",
  tirante: "tirantes",
};

export function productKindToCategory(kind: ProductKind): CatalogCategoryId {
  return KIND_TO_CATEGORY[kind];
}

export function cartLineId(productId: string, serenataSongId?: string): string {
  return serenataSongId ? `${productId}:${serenataSongId}` : productId;
}
