import { formatCurrency } from "@/lib/format";
import type { PublicProduct } from "@/types/database";

export type ProductPricing = {
  preco: number;
  precoPromocional: number | null;
  promoComboQuantidade: number | null;
  promoComboPreco: number | null;
};

export function pricingFromProduct(
  product: Pick<
    PublicProduct,
    | "preco"
    | "preco_promocional"
    | "promo_combo_quantidade"
    | "promo_combo_preco"
  >,
): ProductPricing {
  return {
    preco: Number(product.preco),
    precoPromocional:
      product.preco_promocional != null
        ? Number(product.preco_promocional)
        : null,
    promoComboQuantidade: product.promo_combo_quantidade ?? null,
    promoComboPreco:
      product.promo_combo_preco != null
        ? Number(product.promo_combo_preco)
        : null,
  };
}

export function unitSalePrice(pricing: ProductPricing): number {
  return pricing.precoPromocional ?? pricing.preco;
}

export function lineTotal(
  quantidade: number,
  pricing: ProductPricing,
): number {
  if (quantidade <= 0) return 0;
  let remaining = quantidade;
  let total = 0;
  const unit = unitSalePrice(pricing);

  const comboQty = pricing.promoComboQuantidade;
  const comboPreco = pricing.promoComboPreco;
  if (comboQty != null && comboQty > 1 && comboPreco != null) {
    const bundles = Math.floor(remaining / comboQty);
    total += bundles * comboPreco;
    remaining -= bundles * comboQty;
  }

  total += remaining * unit;
  return Math.round(total * 100) / 100;
}

export function discountPercent(pricing: ProductPricing): number | null {
  const promo = pricing.precoPromocional;
  if (promo == null || pricing.preco <= 0 || promo >= pricing.preco) {
    return null;
  }
  return Math.round((1 - promo / pricing.preco) * 100);
}

export function promoBadgeLabels(pricing: ProductPricing): string[] {
  const labels: string[] = [];
  const pct = discountPercent(pricing);
  if (pct != null && pct > 0) {
    labels.push(`-${pct}%`);
  }
  const q = pricing.promoComboQuantidade;
  const combo = pricing.promoComboPreco;
  if (q != null && q > 1 && combo != null) {
    labels.push(`${q} por ${formatCurrency(combo)}`);
  }
  return labels;
}

export function hasPromotion(pricing: ProductPricing): boolean {
  return promoBadgeLabels(pricing).length > 0;
}

export function cartLinePricing(line: {
  preco: number;
  precoPromocional?: number | null;
  promoComboQuantidade?: number | null;
  promoComboPreco?: number | null;
}): ProductPricing {
  return {
    preco: line.preco,
    precoPromocional: line.precoPromocional ?? null,
    promoComboQuantidade: line.promoComboQuantidade ?? null,
    promoComboPreco: line.promoComboPreco ?? null,
  };
}
