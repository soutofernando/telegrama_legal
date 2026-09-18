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

const KIND_TO_CATEGORY: Record<ProductKind, CatalogCategoryId> = {
  botton: "botoes",
  adesivo: "adesivos",
  serenata: "telegramas",
  prenda: "lembrancas",
  tirante: "lembrancas",
};

export function productKindToCategory(kind: ProductKind): CatalogCategoryId {
  return KIND_TO_CATEGORY[kind];
}

export function cartLineId(productId: string, serenataSongId?: string): string {
  return serenataSongId ? `${productId}:${serenataSongId}` : productId;
}
