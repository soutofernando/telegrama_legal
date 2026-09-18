import {
  hasPromotion,
  pricingFromProduct,
  unitSalePrice,
} from "@/lib/product-pricing";
import { productKindToCategory } from "@/lib/product-kind";
import type { PublicProduct } from "@/types/database";

export type CatalogSortId = "default" | "price-asc" | "price-desc";

export type CatalogCategoryId =
  | "all"
  | "lembrancas"
  | "telegramas"
  | "adesivos"
  | "botoes"
  | "especiais";

export interface CatalogCategory {
  id: CatalogCategoryId;
  label: string;
  emoji: string;
  description: string;
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    id: "all",
    label: "Todos",
    emoji: "✨",
    description: "Tudo no catálogo",
  },
  {
    id: "lembrancas",
    label: "Lembranças",
    emoji: "🎁",
    description: "Prendas para presentear",
  },
  {
    id: "telegramas",
    label: "Telegramas",
    emoji: "💌",
    description: "Mensagens especiais",
  },
  {
    id: "adesivos",
    label: "Adesivos",
    emoji: "⭐",
    description: "Para colar e levar",
  },
  {
    id: "botoes",
    label: "Bottons",
    emoji: "📌",
    description: "Pins e bottons",
  },
  {
    id: "especiais",
    label: "Especiais",
    emoji: "💙",
    description: "Edição do encontro",
  },
];

const CATEGORY_RULES: { id: CatalogCategoryId; patterns: RegExp[] }[] = [
  { id: "telegramas", patterns: [/telegrama/i, /serenata/i] },
  { id: "adesivos", patterns: [/adesivo/i, /sticker/i] },
  { id: "botoes", patterns: [/botton/i, /botão/i, /pin\b/i] },
  {
    id: "especiais",
    patterns: [/especial/i, /edição/i, /premium/i, /kit/i],
  },
];

export function inferProductCategory(product: PublicProduct): CatalogCategoryId {
  if (product.tipo) {
    return productKindToCategory(product.tipo);
  }
  const hay = `${product.nome} ${product.descricao ?? ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(hay))) return rule.id;
  }
  return "lembrancas";
}

export function filterByCategory(
  products: PublicProduct[],
  categoryId: CatalogCategoryId,
): PublicProduct[] {
  if (categoryId === "all") return products;
  return products.filter((p) => inferProductCategory(p) === categoryId);
}

export function filterBySearch(
  products: PublicProduct[],
  query: string,
): PublicProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const hay = `${p.nome} ${p.descricao ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

export function filterByPromotion(
  products: PublicProduct[],
  onlyWithDiscount: boolean,
): PublicProduct[] {
  if (!onlyWithDiscount) return products;
  return products.filter((p) => hasPromotion(pricingFromProduct(p)));
}

export function sortCatalogProducts(
  products: PublicProduct[],
  sort: CatalogSortId,
): PublicProduct[] {
  if (sort === "default") return products;
  const copy = [...products];
  copy.sort((a, b) => {
    const pa = unitSalePrice(pricingFromProduct(a));
    const pb = unitSalePrice(pricingFromProduct(b));
    return sort === "price-asc" ? pa - pb : pb - pa;
  });
  return copy;
}

export function hasCatalogFiltersActive(options: {
  query: string;
  category: CatalogCategoryId;
  onlyWithDiscount: boolean;
  sort: CatalogSortId;
}): boolean {
  return (
    options.query.trim().length > 0 ||
    options.category !== "all" ||
    options.onlyWithDiscount ||
    options.sort !== "default"
  );
}

export function pickFeaturedProduct(
  products: PublicProduct[],
): PublicProduct | null {
  const available = products.filter((p) => p.disponivel);
  const pool = available.length > 0 ? available : products;
  return pool[0] ?? null;
}

export function pickHighlightProducts(
  products: PublicProduct[],
  count = 6,
): PublicProduct[] {
  const available = products.filter((p) => p.disponivel);
  const pool = available.length >= count ? available : products;
  return pool.slice(0, count);
}

export function splitProductSections(products: PublicProduct[]) {
  const available = products.filter((p) => p.disponivel);
  const pool = available.length > 0 ? available : products;
  const featured = pickFeaturedProduct(pool);
  const rest = featured
    ? pool.filter((p) => p.id !== featured.id)
    : [...pool];

  return {
    featured,
    highlights: rest.slice(0, 5),
    popular: rest.slice(5, 10).length
      ? rest.slice(5, 10)
      : rest.slice(0, Math.min(5, rest.length)),
    gifts: rest.filter((p) => inferProductCategory(p) === "lembrancas").slice(0, 6),
    fresh:
      rest.length > 3 ? [...rest].reverse().slice(0, 6) : rest.slice(0, 6),
    all: products,
  };
}
