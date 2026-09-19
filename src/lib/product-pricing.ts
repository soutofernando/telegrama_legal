import { formatCurrency } from "@/lib/format";
import type { CartLine, ProductKind, PublicProduct } from "@/types/database";

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

/** Combo promos apply across different products of the same kind (e.g. any 2 bottons). */
export function comboPoolKey(line: {
  tipo?: ProductKind;
  promoComboQuantidade?: number | null;
  promoComboPreco?: number | null;
}): string | null {
  const comboQty = line.promoComboQuantidade ?? null;
  const comboPreco = line.promoComboPreco ?? null;
  if (
    line.tipo &&
    comboQty != null &&
    comboQty > 1 &&
    comboPreco != null
  ) {
    return `${line.tipo}:${comboQty}:${comboPreco}`;
  }
  return null;
}

export function allocateCartLineTotals(lines: CartLine[]): Map<string, number> {
  const amounts = new Map<string, number>();
  const pools = new Map<string, CartLine[]>();

  for (const line of lines) {
    const key = comboPoolKey(line);
    if (!key) {
      amounts.set(
        line.lineId,
        lineTotal(line.quantidade, cartLinePricing(line)),
      );
      continue;
    }
    const bucket = pools.get(key) ?? [];
    bucket.push(line);
    pools.set(key, bucket);
  }

  for (const poolLines of pools.values()) {
    const pricing = cartLinePricing(poolLines[0]);
    const totalQty = poolLines.reduce((sum, line) => sum + line.quantidade, 0);
    const poolTotal = lineTotal(totalQty, pricing);
    let allocated = 0;

    poolLines.forEach((line, index) => {
      if (index === poolLines.length - 1) {
        amounts.set(
          line.lineId,
          Math.round((poolTotal - allocated) * 100) / 100,
        );
        return;
      }
      const share =
        Math.round((poolTotal * line.quantidade) / totalQty * 100) / 100;
      amounts.set(line.lineId, share);
      allocated += share;
    });
  }

  return amounts;
}

export function cartSubtotal(lines: CartLine[]): number {
  const amounts = allocateCartLineTotals(lines);
  const total = [...amounts.values()].reduce((sum, value) => sum + value, 0);
  return Math.round(total * 100) / 100;
}

export function cartLineAmount(
  line: CartLine,
  lines: CartLine[],
): number {
  const amounts = allocateCartLineTotals(lines);
  return amounts.get(line.lineId) ?? lineTotal(line.quantidade, cartLinePricing(line));
}
