"use client";

import { useRef, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useCartAnimation } from "@/context/cart-animation-context";
import { prefersReducedMotion } from "@/lib/motion";
import { pricingFromProduct } from "@/lib/product-pricing";
import type { PublicProduct } from "@/types/database";
import { ShoppingCart } from "lucide-react";
import { QuantitySelector } from "@/components/vitrine/quantity-selector";
import { ProductImage } from "@/components/vitrine/product-image";

export function AddToCartButton({
  product,
  maxQuantity,
  disponivel,
  compact,
  card,
  imageRef,
  serenataSongId,
  serenataSongTitulo,
  requireSerenataSong,
}: {
  product: PublicProduct;
  maxQuantity: number;
  disponivel: boolean;
  compact?: boolean;
  card?: boolean;
  imageRef?: React.RefObject<HTMLElement | null>;
  serenataSongId?: string;
  serenataSongTitulo?: string;
  requireSerenataSong?: boolean;
}) {
  const { addItem } = useCart();
  const { flyToCart } = useCartAnimation();
  const [qty, setQty] = useState(1);
  const [success, setSuccess] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const localImageRef = useRef<HTMLDivElement>(null);
  const pricing = pricingFromProduct(product);

  const missingSong = Boolean(requireSerenataSong && !serenataSongId);
  const canAdd = disponivel && maxQuantity >= 1 && !missingSong;

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
      quantidade: qty,
      serenataSongId,
      serenataSongTitulo,
    });

    const source =
      imageRef?.current?.getBoundingClientRect() ??
      localImageRef.current?.getBoundingClientRect();
    if (source) {
      flyToCart({ imageUrl: product.imagem_url, fromRect: source });
    }

    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 1600);

    const btn = btnRef.current;
    if (btn && !prefersReducedMotion()) {
      void import("gsap").then((gsap) => {
        gsap.default.fromTo(
          btn,
          { scale: 1 },
          { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 },
        );
      });
    }
  };

  if (card) {
    return (
      <>
        <div ref={localImageRef} className="pointer-events-none absolute inset-0 opacity-0" aria-hidden />
        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAdd();
          }}
          disabled={!canAdd}
          className="touch-target flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
          aria-live="polite"
        >
          <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
          {success
            ? "Adicionado"
            : !disponivel
              ? "Esgotado"
              : missingSong
                ? "Escolher opções"
                : "Adicionar ao carrinho"}
        </button>
      </>
    );
  }

  if (compact) {
    return (
      <>
        <div ref={localImageRef} className="pointer-events-none absolute inset-0 opacity-0" aria-hidden />
        <button
          ref={btnRef}
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-md transition-transform active:scale-90 disabled:opacity-40"
          aria-label={`Adicionar ${product.nome} ao carrinho`}
        >
          {success ? "✓" : "+"}
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-semibold text-muted">Quantidade</label>
        <QuantitySelector
          value={qty}
          max={Math.max(1, maxQuantity)}
          disabled={!disponivel}
          onChange={setQty}
        />
      </div>
      <div ref={localImageRef} className="sr-only" aria-hidden>
        <ProductImage src={product.imagem_url} alt="" width={64} height={64} />
      </div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="btn-primary w-full disabled:opacity-40"
      >
        {success
          ? "Adicionado ✓"
          : !disponivel
            ? "Esgotado"
            : missingSong
              ? "Escolha a música"
              : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
