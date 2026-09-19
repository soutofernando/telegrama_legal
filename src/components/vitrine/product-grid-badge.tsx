import {
  hasPromotion,
  pricingFromProduct,
  promoBadgeLabels,
} from "@/lib/product-pricing";
import type { PublicProduct } from "@/types/database";

export type GridBadgeVariant =
  | "featured"
  | "lowStock"
  | "promo"
  | "bestseller"
  | "new";

const VARIANT_CLASS: Record<GridBadgeVariant, string> = {
  featured:
    "bg-primary text-white shadow-sm shadow-primary/25",
  lowStock:
    "bg-secondary text-neutral-900 shadow-sm shadow-secondary/30",
  promo: "bg-accent text-white shadow-sm shadow-accent/20",
  bestseller: "bg-foreground/90 text-white shadow-sm",
  new: "border border-primary/25 bg-card/95 text-primary shadow-sm backdrop-blur-sm",
};

/** Estoque ≤ 10 (maxQuantity reflete o estoque real até o cap de 20). */
export function isLowStockProduct(
  disponivel: boolean,
  maxQuantity?: number,
): boolean {
  return (
    disponivel &&
    typeof maxQuantity === "number" &&
    maxQuantity > 0 &&
    maxQuantity <= 10
  );
}

/** Um selo por card: destaque → últimas unidades → promo → mais vendido → novo */
export function pickGridBadge(options: {
  product: PublicProduct;
  featuredInGrid?: boolean;
  highlightBadge?: "bestseller" | "new";
  maxQuantity?: number;
}): { variant: GridBadgeVariant; label: string } | null {
  if (options.featuredInGrid) {
    return { variant: "featured", label: "Destaque" };
  }

  if (isLowStockProduct(options.product.disponivel, options.maxQuantity)) {
    return { variant: "lowStock", label: "Últimas unidades" };
  }

  const pricing = pricingFromProduct(options.product);
  if (hasPromotion(pricing)) {
    const labels = promoBadgeLabels(pricing);
    if (labels.length > 0) {
      const combo = labels.find((l) => l.toLowerCase().includes(" por "));
      return { variant: "promo", label: combo ?? labels[0] };
    }
  }

  if (options.highlightBadge === "bestseller") {
    return { variant: "bestseller", label: "Mais vendido" };
  }
  if (options.highlightBadge === "new") {
    return { variant: "new", label: "Novo" };
  }

  return null;
}

export function ProductGridBadge({
  product,
  featuredInGrid,
  highlightBadge,
  maxQuantity,
}: {
  product: PublicProduct;
  featuredInGrid?: boolean;
  highlightBadge?: "bestseller" | "new";
  maxQuantity?: number;
}) {
  const badge = pickGridBadge({
    product,
    featuredInGrid,
    highlightBadge,
    maxQuantity,
  });
  if (!badge) return null;

  return (
    <span
      className={`pointer-events-none absolute left-2 top-2 z-[1] max-w-[calc(100%-1rem)] truncate rounded-lg px-2 py-1 text-[10px] font-bold uppercase leading-tight tracking-wide ${VARIANT_CLASS[badge.variant]}`}
    >
      {badge.label}
    </span>
  );
}
