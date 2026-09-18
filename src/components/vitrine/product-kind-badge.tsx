import { PRODUCT_KIND_LABELS } from "@/lib/product-kind";
import type { ProductKind } from "@/types/database";
import { StoreBadge } from "@/components/vitrine/store-badge";

export function ProductKindBadge({
  kind,
  variant = "secondary",
}: {
  kind: ProductKind;
  variant?: "secondary" | "outline";
}) {
  return (
    <StoreBadge variant={variant}>{PRODUCT_KIND_LABELS[kind]}</StoreBadge>
  );
}
