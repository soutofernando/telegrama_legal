"use client";

import { useRef } from "react";
import { useCart } from "@/context/cart-context";
import { useCartAnimation } from "@/context/cart-animation-context";
import { formatCurrency } from "@/lib/format";
import { lineTotal, pricingFromProduct, unitSalePrice } from "@/lib/product-pricing";
import { prefersReducedMotion } from "@/lib/motion";
import type { PublicProduct } from "@/types/database";

export function StickyAddBar({
  product,
  maxQuantity,
  imageRef,
  serenataSongId,
  serenataSongTitulo,
  requireSerenataSong,
}: {
  product: PublicProduct;
  maxQuantity: number;
  imageRef: React.RefObject<HTMLElement | null>;
  serenataSongId?: string;
  serenataSongTitulo?: string;
  requireSerenataSong?: boolean;
}) {
  const { addItem } = useCart();
  const { flyToCart } = useCartAnimation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const pricing = pricingFromProduct(product);

  const missingSong = Boolean(requireSerenataSong && !serenataSongId);
  const canAdd = maxQuantity >= 1 && !missingSong;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      tipo: product.tipo,
      nome: product.nome,
      preco: pricing.preco,
      precoPromocional: pricing.precoPromocional,
      promoComboQuantidade: pricing.promoComboQuantidade,
      promoComboPreco: pricing.promoComboPreco,
      imagem_url: product.imagem_url,
      maxQuantity,
      quantidade: 1,
      serenataSongId,
      serenataSongTitulo,
    });
    const rect =
      imageRef.current?.getBoundingClientRect() ??
      btnRef.current?.getBoundingClientRect();
    if (rect) flyToCart({ imageUrl: product.imagem_url, fromRect: rect });

    if (btnRef.current && !prefersReducedMotion()) {
      void import("gsap").then((gsap) => {
        gsap.default.fromTo(
          btnRef.current,
          { scale: 1 },
          { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 },
        );
      });
    }
  };

  const displayPrice = lineTotal(1, pricing);

  return (
    <div
      className="fixed inset-x-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden"
      style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <p className="shrink-0 text-lg font-bold text-primary">
          {formatCurrency(displayPrice)}
          {displayPrice !== unitSalePrice(pricing) && (
            <span className="ml-1 text-xs font-medium text-muted">/ un.</span>
          )}
        </p>
        <button
          ref={btnRef}
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="btn-primary min-h-12 flex-1 disabled:opacity-40"
        >
          {missingSong ? "Escolha a música" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
