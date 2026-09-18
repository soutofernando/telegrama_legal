import Link from "next/link";
import { Star } from "lucide-react";
import type { PublicProduct } from "@/types/database";
import { formatCurrency } from "@/lib/format";
import { ProductPrice } from "@/components/vitrine/product-price";
import { ProductImage } from "@/components/vitrine/product-image";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import { StoreBadge } from "@/components/vitrine/store-badge";

export function FeaturedProduct({
  product,
  label = "Destaque do encontro",
}: {
  product: PublicProduct;
  label?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary-soft via-card to-secondary-soft/30 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 sm:items-center sm:gap-6">
        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl bg-card shadow-md sm:max-w-none">
          <div className="absolute inset-3">
            <div className="relative h-full w-full">
              <ProductImage
                src={product.imagem_url}
                alt={product.nome}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 240px, 400px"
                priority
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ProductKindBadge kind={product.tipo} variant="outline" />
            <StoreBadge variant="outline">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" aria-hidden />
                {label}
              </span>
            </StoreBadge>
          </div>
          <h2 className="font-display mt-3 text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
            {product.nome}
          </h2>
          <div className="mt-1">
            <ProductPrice product={product} />
          </div>
          {product.descricao && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
              {product.descricao}
            </p>
          )}
          <Link
            href={`/loja/${product.id}`}
            className="btn-primary mt-4 inline-flex w-full sm:w-auto"
          >
            Ver produto
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CompactFeaturedProduct({
  product,
  maxQuantity,
}: {
  product: PublicProduct;
  maxQuantity?: number;
}) {
  const canQuickAdd =
    product.disponivel && typeof maxQuantity === "number" && maxQuantity > 0;

  return (
    <section
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
      aria-label="Produto em destaque"
    >
      <Link
        href={`/loja/${product.id}`}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background"
      >
        <div className="absolute inset-1">
          <div className="relative h-full w-full">
            <ProductImage
              src={product.imagem_url}
              alt={product.nome}
              fill
              className="object-contain"
              sizes="56px"
            />
          </div>
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Produto em destaque
        </p>
        <Link
          href={`/loja/${product.id}`}
          className="font-display line-clamp-1 text-sm font-bold text-foreground hover:text-primary"
        >
          {product.nome}
        </Link>
        <ProductPrice product={product} size="sm" />
      </div>
      <Link
        href={`/loja/${product.id}`}
        className="btn-primary shrink-0 px-3 py-2 text-xs sm:text-sm"
      >
        {canQuickAdd ? "Ver e comprar" : "Ver"}
      </Link>
    </section>
  );
}

export function CatalogProductHero({ product }: { product: PublicProduct }) {
  return (
    <section className="rounded-2xl border border-border bg-primary-soft/40 p-4">
      <div className="flex flex-col items-center text-center">
        <StoreBadge variant="secondary">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" aria-hidden />
            Destaque
          </span>
        </StoreBadge>
        <div className="relative mt-4 aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl bg-card shadow-md">
          <div className="absolute inset-3">
            <div className="relative h-full w-full">
              <ProductImage
                src={product.imagem_url}
                alt={product.nome}
                fill
                className="object-contain"
                sizes="200px"
                priority
              />
            </div>
          </div>
        </div>
        <h2 className="font-display mt-4 text-lg font-extrabold text-foreground">
          {product.nome}
        </h2>
        <div className="mt-0.5">
          <ProductPrice product={product} />
        </div>
        <Link href={`/loja/${product.id}`} className="btn-primary mt-4 w-full max-w-xs">
          Ver produto
        </Link>
      </div>
    </section>
  );
}
