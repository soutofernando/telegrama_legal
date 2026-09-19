import {
  hasPromotion,
  pricingFromProduct,
  promoBadgeLabels,
} from "@/lib/product-pricing";
import type { PublicProduct } from "@/types/database";
import { StoreBadge } from "@/components/vitrine/store-badge";

export function ProductPromoBadges({
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
  size?: "md" | "sm";
}) {
  const pricing = pricingFromProduct(product);
  if (!hasPromotion(pricing)) return null;
  const labels = promoBadgeLabels(pricing);

  if (size === "sm") {
    return (
      <>
        {labels.map((label) => (
          <span
            key={label}
            className="inline-flex max-w-full shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white"
          >
            {label}
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {labels.map((label) => (
        <StoreBadge key={label} variant="accent">{label}</StoreBadge>
      ))}
    </>
  );
}
