import {
  hasPromotion,
  pricingFromProduct,
  unitSalePrice,
} from "@/lib/product-pricing";
import { productKindToCategory } from "@/lib/product-kind";
import type { PublicProduct } from "@/types/database";

export type CatalogSortId =
  | "default"
  | "bestsellers"
  | "price-asc"
  | "price-desc";

export type CatalogPriceRangeId = "all" | "under-15" | "15-30" | "over-30";

export type CatalogCategoryId =
  | "all"
  | "serenatas"
  | "prendas"
  | "tirantes"
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
    id: "serenatas",
    label: "Serenatas",
    emoji: "🎵",
    description: "Música e mensagem ao vivo",
  },
  {
    id: "prendas",
    label: "Prendas",
    emoji: "🎁",
    description: "Presentes para presentear",
  },
  {
    id: "tirantes",
    label: "Tirantes",
    emoji: "🪪",
    description: "Crachás e cordões",
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
];

const CATEGORY_RULES: { id: CatalogCategoryId; patterns: RegExp[] }[] = [
  { id: "serenatas", patterns: [/serenata/i] },
  {
    id: "tirantes",
    patterns: [/tirante/i, /crachá/i, /credencial/i, /telegrama/i],
  },
  { id: "adesivos", patterns: [/adesivo/i, /sticker/i] },
  { id: "botoes", patterns: [/botton/i, /botão/i, /pin\b/i] },
  {
    id: "especiais",
    patterns: [/especial/i, /edição/i, /premium/i, /kit/i],
  },
];

export function buildCatalogOrderMap(
  products: PublicProduct[],
): Map<string, number> {
  return new Map(products.map((p, index) => [p.id, index]));
}

export function buildBestSellerRankMap(
  bestSellerIds: string[],
): Map<string, number> {
  return new Map(bestSellerIds.map((id, index) => [id, index]));
}

export function inferProductCategory(product: PublicProduct): CatalogCategoryId {
  if (product.tipo) {
    return productKindToCategory(product.tipo);
  }
  const hay = `${product.nome} ${product.descricao ?? ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(hay))) return rule.id;
  }
  return "prendas";
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

export function filterByAvailability(
  products: PublicProduct[],
  onlyAvailable: boolean,
): PublicProduct[] {
  if (!onlyAvailable) return products;
  return products.filter((p) => p.disponivel);
}

export function filterByBestSellers(
  products: PublicProduct[],
  onlyBestSellers: boolean,
  bestSellerIds: Set<string>,
): PublicProduct[] {
  if (!onlyBestSellers) return products;
  return products.filter((p) => bestSellerIds.has(p.id));
}

export function filterByPriceRange(
  products: PublicProduct[],
  priceRange: CatalogPriceRangeId,
): PublicProduct[] {
  if (priceRange === "all") return products;
  return products.filter((p) => {
    const price = unitSalePrice(pricingFromProduct(p));
    if (priceRange === "under-15") return price < 15;
    if (priceRange === "15-30") return price >= 15 && price <= 30;
    return price > 30;
  });
}

export type CatalogSortContext = {
  catalogOrder: Map<string, number>;
  bestSellerRank: Map<string, number>;
  featuredProductId: string | null;
};

function catalogIndex(order: Map<string, number>, id: string): number {
  return order.get(id) ?? Number.MAX_SAFE_INTEGER;
}

export function sortCatalogProducts(
  products: PublicProduct[],
  sort: CatalogSortId,
  context?: CatalogSortContext,
): PublicProduct[] {
  const copy = [...products];
  const order = context?.catalogOrder ?? new Map<string, number>();
  const bestSellerRank = context?.bestSellerRank ?? new Map<string, number>();
  const featuredId = context?.featuredProductId ?? null;

  if (sort === "price-asc" || sort === "price-desc") {
    copy.sort((a, b) => {
      const pa = unitSalePrice(pricingFromProduct(a));
      const pb = unitSalePrice(pricingFromProduct(b));
      return sort === "price-asc" ? pa - pb : pb - pa;
    });
    return copy;
  }

  if (sort === "bestsellers") {
    copy.sort((a, b) => {
      const ra = bestSellerRank.has(a.id)
        ? bestSellerRank.get(a.id)!
        : Number.MAX_SAFE_INTEGER;
      const rb = bestSellerRank.has(b.id)
        ? bestSellerRank.get(b.id)!
        : Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return catalogIndex(order, a.id) - catalogIndex(order, b.id);
    });
    return copy;
  }

  copy.sort((a, b) => {
    const tier = (p: PublicProduct): [number, number, number] => {
      if (featuredId && p.id === featuredId) return [0, 0, catalogIndex(order, p.id)];
      if (bestSellerRank.has(p.id)) {
        return [1, bestSellerRank.get(p.id)!, catalogIndex(order, p.id)];
      }
      if (hasPromotion(pricingFromProduct(p))) {
        return [2, 0, catalogIndex(order, p.id)];
      }
      return [3, 0, catalogIndex(order, p.id)];
    };
    const ta = tier(a);
    const tb = tier(b);
    if (ta[0] !== tb[0]) return ta[0] - tb[0];
    if (ta[1] !== tb[1]) return ta[1] - tb[1];
    return ta[2] - tb[2];
  });
  return copy;
}

export function countCatalogPanelFilters(options: {
  onlyWithDiscount: boolean;
  onlyAvailable: boolean;
  onlyBestSellers: boolean;
  priceRange: CatalogPriceRangeId;
}): number {
  let count = 0;
  if (options.onlyWithDiscount) count += 1;
  if (options.onlyAvailable) count += 1;
  if (options.onlyBestSellers) count += 1;
  if (options.priceRange !== "all") count += 1;
  return count;
}

export function hasCatalogFiltersActive(options: {
  query: string;
  category: CatalogCategoryId;
  onlyWithDiscount: boolean;
  onlyAvailable: boolean;
  onlyBestSellers: boolean;
  priceRange: CatalogPriceRangeId;
  sort: CatalogSortId;
}): boolean {
  return (
    options.query.trim().length > 0 ||
    options.category !== "all" ||
    options.onlyWithDiscount ||
    options.onlyAvailable ||
    options.onlyBestSellers ||
    options.priceRange !== "all" ||
    options.sort !== "default"
  );
}

/** Produto em destaque (patrocinado): primeiro disponível na ordem de cadastro. */
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
    gifts: rest.filter((p) => inferProductCategory(p) === "prendas").slice(0, 6),
    fresh:
      rest.length > 3 ? [...rest].reverse().slice(0, 6) : rest.slice(0, 6),
    all: products,
  };
}
