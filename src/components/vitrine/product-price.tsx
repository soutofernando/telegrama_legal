import { formatCurrency } from "@/lib/format";
import {
  pricingFromProduct,
  unitSalePrice,
} from "@/lib/product-pricing";
import type { PublicProduct } from "@/types/database";

export function ProductPrice({
  product,
  size = "md",
}: {
  product: Pick<
    PublicProduct,
    | "preco"
    | "preco_promocional"
    | "promo_combo_quantidade"
    | "promo_combo_preco"
  >;
  size?: "sm" | "md";
}) {
  const pricing = pricingFromProduct(product);
  const sale = unitSalePrice(pricing);
  const onPromo =
    pricing.precoPromocional != null &&
    pricing.precoPromocional < pricing.preco;

  const priceClass =
    size === "sm" ? "text-sm" : "text-base";

  if (!onPromo) {
    return (
      <p className={`font-bold text-primary ${priceClass}`}>
        {formatCurrency(sale)}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <p className={`font-bold text-primary ${priceClass}`}>
        {formatCurrency(sale)}
      </p>
      <p className="text-xs font-medium text-muted line-through">
        {formatCurrency(pricing.preco)}
      </p>
    </div>
  );
}
