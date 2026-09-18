"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { PublicProduct, SerenataSong } from "@/types/database";
import { ProductImage } from "@/components/vitrine/product-image";
import { AddToCartButton } from "@/components/vitrine/add-to-cart-button";
import { ProductKindBadge } from "@/components/vitrine/product-kind-badge";
import { ProductPromoBadges } from "@/components/vitrine/product-promo-badges";
import { ProductPrice } from "@/components/vitrine/product-price";
import { StickyAddBar } from "@/components/vitrine/sticky-add-bar";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";

export function ProductDetailView({
  product,
  maxQuantity,
  serenataSongs = [],
}: {
  product: PublicProduct;
  maxQuantity: number;
  serenataSongs?: SerenataSong[];
}) {
  const [showSticky, setShowSticky] = useState(false);
  const [serenataSongId, setSerenataSongId] = useState("");
  const imageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const isSerenata = product.tipo === "serenata";
  const selectedSong = useMemo(
    () => serenataSongs.find((s) => s.id === serenataSongId),
    [serenataSongs, serenataSongId],
  );

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={`border-b border-border bg-card py-3 md:hidden ${VITRINE_GUTTER}`}>
        <Link
          href="/loja"
          className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Catálogo
        </Link>
      </div>

      <div className={`relative mx-auto max-w-6xl py-5 pb-24 sm:py-8 sm:pb-10 ${VITRINE_GUTTER}`}>
        <div className="relative flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-10">
          <div
            ref={imageRef}
            className="relative aspect-square overflow-hidden rounded-3xl bg-background shadow-md"
          >
            <div className="absolute inset-4 sm:inset-6">
              <div className="relative h-full w-full">
                <ProductImage
                  src={product.imagem_url}
                  alt={product.nome}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
            {!product.disponivel && (
              <span className="badge-esgotado absolute left-4 top-4">Esgotado</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProductKindBadge kind={product.tipo} variant="outline" />
              <ProductPromoBadges product={product} />
            </div>
            <h1 className="font-display mt-4 text-3xl font-extrabold leading-tight text-foreground">
              {product.nome}
            </h1>
            <div className="mt-3 text-2xl">
              <ProductPrice product={product} />
            </div>
            {product.descricao && (
              <p className="mt-6 text-base leading-relaxed text-muted">
                {product.descricao}
              </p>
            )}
            {isSerenata && (
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-semibold text-muted">
                  Música da serenata
                </label>
                {serenataSongs.length === 0 ? (
                  <p className="text-sm text-muted">
                    Nenhuma música disponível no momento. Volte em breve.
                  </p>
                ) : (
                  <select
                    required
                    value={serenataSongId}
                    onChange={(e) => setSerenataSongId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Selecione a música…</option>
                    {serenataSongs.map((song) => (
                      <option key={song.id} value={song.id}>
                        {song.titulo}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div ref={ctaRef} className="mt-8">
              <AddToCartButton
                product={product}
                maxQuantity={maxQuantity}
                disponivel={product.disponivel}
                imageRef={imageRef}
                requireSerenataSong={isSerenata && serenataSongs.length > 0}
                serenataSongId={serenataSongId || undefined}
                serenataSongTitulo={selectedSong?.titulo}
              />
            </div>
          </div>
        </div>
      </div>

      {showSticky && product.disponivel && maxQuantity > 0 && (
        <StickyAddBar
          product={product}
          maxQuantity={maxQuantity}
          imageRef={imageRef}
          requireSerenataSong={isSerenata && serenataSongs.length > 0}
          serenataSongId={serenataSongId || undefined}
          serenataSongTitulo={selectedSong?.titulo}
        />
      )}
    </>
  );
}
