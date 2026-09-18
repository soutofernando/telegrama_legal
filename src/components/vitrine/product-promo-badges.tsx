import {
  hasPromotion,
  pricingFromProduct,
  promoBadgeLabels,
} from "@/lib/product-pricing";
import type { PublicProduct } from "@/types/database";
import { StoreBadge } from "@/components/vitrine/store-badge";

export function ProductPromoBadges({
  product,
}: {
  product: Pick<
    PublicProduct,
    | "preco"
    | "preco_promocional"
    | "promo_combo_quantidade"
    | "promo_combo_preco"
  >;
}) {
  const pricing = pricingFromProduct(product);
  if (!hasPromotion(pricing)) return null;
  const labels = promoBadgeLabels(pricing);

  return (
    <>
      {labels.map((label) => (
        <StoreBadge key={label} variant="accent">{label}</StoreBadge>
      ))}
    </>
  );
}
