import type { CatalogCategoryId } from "@/lib/catalog-helpers";
import {
  Gift,
  Heart,
  Mail,
  Pin,
  LayoutGrid,
  Star,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<CatalogCategoryId, LucideIcon> = {
  all: LayoutGrid,
  lembrancas: Gift,
  telegramas: Mail,
  adesivos: Star,
  botoes: Pin,
  especiais: Heart,
};

export function CategoryIcon({
  categoryId,
  className,
  inverted,
}: {
  categoryId: CatalogCategoryId;
  className?: string;
  inverted?: boolean;
}) {
  const Icon = ICONS[categoryId];
  return (
    <Icon
      className={`h-5 w-5 shrink-0 ${inverted ? "text-white" : "text-primary"} ${className ?? ""}`}
      strokeWidth={2}
      aria-hidden
    />
  );
}
