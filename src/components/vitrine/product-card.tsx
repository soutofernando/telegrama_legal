"use client";

import Link from "next/link";
import type { PublicProduct } from "@/types/database";
import { ProductImage } from "@/components/vitrine/product-image";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import { ProductPromoBadges } from "@/components/vitrine/product-promo-badges";
import { ProductPrice } from "@/components/vitrine/product-price";
import { AddToCartButton } from "@/components/vitrine/add-to-cart-button";

export type ProductCardVariant = "grid" | "medium" | "large" | "compact";

const CAROUSEL_WIDTH: Record<Exclude<ProductCardVariant, "grid">, string> = {
  large: "w-[11.5rem]",
  medium: "w-[10.25rem]",
  compact: "w-[9.5rem]",
};

export function ProductCard({
  product,
  variant = "grid",
  showQuickAdd,
  maxQuantity,
  className,
  highlightBadge,
}: {
  product: PublicProduct;
  variant?: ProductCardVariant;
  showQuickAdd?: boolean;
  maxQuantity?: number;
  className?: string;
  highlightBadge?: "bestseller" | "new";
}) {
  const isCarousel = variant !== "grid";
  const isCompact = variant === "compact" || isCarousel;
  const isGrid = variant === "grid";
  const isSerenata = product.tipo === "serenata";
  const widthClass = isCarousel ? CAROUSEL_WIDTH[variant] : "w-full";

  const showCardCart =
    isGrid &&
    product.disponivel &&
    typeof maxQuantity === "number" &&
    maxQuantity > 0 &&
    !isSerenata;

  const showSerenataCta = isGrid && isSerenata && product.disponivel;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${widthClass} ${className ?? ""}`}
    >
      <Link
        href={`/loja/${product.id}`}
        className="flex min-h-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="relative aspect-square shrink-0 bg-background">
          <div className={`absolute ${isGrid ? "inset-2.5" : "inset-2"}`}>
            <div className="relative h-full w-full">
              <ProductImage
                src={product.imagem_url}
                alt={product.nome}
                fill
                className="object-contain"
                sizes={isGrid ? "(max-width: 640px) 50vw, 25vw" : isCompact ? "152px" : "180px"}
              />
            </div>
          </div>
          {!product.disponivel && (
            <span className="badge-esgotado absolute left-2 top-2 text-[10px]">
              Esgotado
            </span>
          )}
          {product.disponivel && (
            <span className="absolute left-2 top-2 flex max-w-[calc(100%-0.5rem)] flex-col gap-1">
              {highlightBadge === "bestseller" && (
                <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-card">
                  Mais vendido
                </span>
              )}
              {highlightBadge === "new" && (
                <span className="rounded-md border border-primary bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  Novo
                </span>
              )}
              {!isGrid && <ProductKindBadge kind={product.tipo} />}
              <ProductPromoBadges product={product} />
            </span>
          )}
        </div>
        <div
          className={`flex flex-col gap-1 px-2.5 pt-2 ${
            isGrid ? "pb-2" : isCompact ? "pb-2" : "pb-2.5"
          } ${showQuickAdd ? "pb-10" : ""}`}
        >
          <h3
            className={`font-display line-clamp-2 font-bold leading-snug text-foreground ${
              isGrid ? "text-sm" : isCompact ? "text-xs" : "text-sm"
            }`}
          >
            {product.nome}
          </h3>
          <ProductPrice product={product} size={isGrid ? "md" : "sm"} />
        </div>
      </Link>

      {showCardCart && (
        <div className="px-2.5 pb-2.5 pt-0">
          <AddToCartButton
            card
            product={product}
            maxQuantity={maxQuantity}
            disponivel={product.disponivel}
          />
        </div>
      )}

      {showSerenataCta && (
        <div className="px-2.5 pb-2.5 pt-0">
          <Link
            href={`/loja/${product.id}`}
            className="touch-target flex w-full min-h-11 items-center justify-center rounded-xl border border-primary bg-primary-soft px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm"
          >
            Personalizar e comprar
          </Link>
        </div>
      )}

      {isGrid &&
        product.disponivel &&
        !showCardCart &&
        !showSerenataCta && (
          <div className="px-2.5 pb-2.5 pt-0">
            <Link
              href={`/loja/${product.id}`}
              className="touch-target flex w-full min-h-11 items-center justify-center rounded-xl border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-soft sm:text-sm"
            >
              Ver produto
            </Link>
          </div>
        )}

      {showQuickAdd &&
        product.disponivel &&
        typeof maxQuantity === "number" &&
        maxQuantity > 0 && (
          <div className="absolute bottom-2 right-2 z-10">
            <AddToCartButton
              compact
              product={product}
              maxQuantity={maxQuantity}
              disponivel={product.disponivel}
            />
          </div>
        )}
    </article>
  );
}
