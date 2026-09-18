"use client";

import { CartItem } from "@/components/vitrine/cart-item";
import { CartSummary } from "@/components/vitrine/cart-summary";
import { EmptyCart } from "@/components/vitrine/empty-cart";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 sm:py-8">
      <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
        Seu carrinho 🛒
      </h1>
      <p className="mt-1 text-sm text-muted">
        Revise suas lembranças antes de continuar.
      </p>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.lineId}
                item={item}
                onUpdateQuantity={(qty) => updateQuantity(item.lineId, qty)}
                onRemove={() => removeItem(item.lineId)}
              />
            ))}
          </ul>
          <div className="mt-8">
            <CartSummary subtotal={subtotal} />
          </div>
        </>
      )}
    </div>
  );
}
