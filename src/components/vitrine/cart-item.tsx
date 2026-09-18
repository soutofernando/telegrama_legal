"use client";

import { ProductImage } from "@/components/vitrine/product-image";
import { QuantitySelector } from "@/components/vitrine/quantity-selector";
import { formatCurrency } from "@/lib/format";
import { cartLinePricing, lineTotal } from "@/lib/product-pricing";
import type { CartLine } from "@/types/database";

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartLine;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-background">
          <div className="absolute inset-1.5">
            <div className="relative h-full w-full">
              <ProductImage
                src={item.imagem_url}
                alt={item.nome}
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display font-bold text-foreground">{item.nome}</p>
            <button
              type="button"
              onClick={onRemove}
              className="touch-target shrink-0 text-xs font-semibold text-muted hover:text-accent"
            >
              Remover
            </button>
          </div>
          <p className="text-sm text-muted">
            {formatCurrency(lineTotal(1, cartLinePricing(item)))} cada
            {item.quantidade > 1 ? ` · ${item.quantidade} un.` : ""}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <QuantitySelector
              compact
              value={item.quantidade}
              max={item.maxQuantity}
              onChange={onUpdateQuantity}
            />
            <p className="text-base font-bold text-primary">
              {formatCurrency(lineTotal(item.quantidade, cartLinePricing(item)))}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
