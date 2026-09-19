import {
  PRODUCT_KIND_LABELS,
  productKindBadgeClassName,
} from "@/lib/product-kind";
import type { ProductKind } from "@/types/database";

export function ProductKindBadge({
  kind,
  variant = "secondary",
}: {
  kind: ProductKind;
  variant?: "secondary" | "outline";
}) {
  const style = variant === "outline" ? "outline" : "filled";
  return (
    <span className={productKindBadgeClassName(kind, style)}>
      {PRODUCT_KIND_LABELS[kind]}
    </span>
  );
}
