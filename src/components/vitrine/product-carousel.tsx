"use client";

import { Flame } from "lucide-react";
import type { PublicProduct } from "@/types/database";
import { ProductCard } from "@/components/vitrine/product-card";

type CarouselTone = "highlight" | "popular" | "gift" | "fresh";

const toneStyles: Record<CarouselTone, { titleAccent: string }> = {
  highlight: { titleAccent: "text-primary" },
  popular: { titleAccent: "text-foreground" },
  gift: { titleAccent: "text-accent" },
  fresh: { titleAccent: "text-primary" },
};

export function ProductCarousel({
  title,
  subtitle,
  products,
  tone = "highlight",
  variant = "compact",
  maxQuantities,
  showQuickAdd,
  showFlame,
}: {
  title: string;
  subtitle?: string;
  products: PublicProduct[];
  tone?: CarouselTone;
  variant?: "large" | "medium" | "compact";
  maxQuantities?: Record<string, number>;
  showQuickAdd?: boolean;
  showFlame?: boolean;
}) {
  if (!products.length) return null;
  const styles = toneStyles[tone];

  return (
    <section className="space-y-3">
      <div>
        <h2
          className={`font-display flex items-center gap-2 text-lg font-extrabold ${styles.titleAccent}`}
        >
          {showFlame && <Flame className="h-5 w-5 text-accent" aria-hidden />}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="carousel-track flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1">
        {products.map((product) => (
          <div key={product.id} className="snap-start shrink-0">
            <ProductCard
              product={product}
              variant={variant}
              showQuickAdd={showQuickAdd}
              maxQuantity={maxQuantities?.[product.id]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
