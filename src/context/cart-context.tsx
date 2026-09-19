"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cartLineId } from "@/lib/product-kind";
import { cartLineAmount, cartSubtotal } from "@/lib/product-pricing";
import type { CartLine } from "@/types/database";

const STORAGE_KEY = "telegrama-legal-cart";

function normalizeCartLine(raw: CartLine): CartLine {
  const lineId =
    raw.lineId ??
    cartLineId(raw.productId, raw.serenataSongId);
  return {
    ...raw,
    lineId,
    precoPromocional: raw.precoPromocional ?? null,
    promoComboQuantidade: raw.promoComboQuantidade ?? null,
    promoComboPreco: raw.promoComboPreco ?? null,
  };
}

interface CartContextValue {
  items: CartLine[];
  addItem: (line: Omit<CartLine, "quantidade" | "lineId"> & {
    quantidade?: number;
  }) => void;
  updateQuantity: (lineId: string, quantidade: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  subtotal: number;
  lineAmount: (line: CartLine) => number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setItems(parsed.map(normalizeCartLine));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (
      line: Omit<CartLine, "quantidade" | "lineId"> & { quantidade?: number },
    ) => {
      const qty = line.quantidade ?? 1;
      const lineId = cartLineId(line.productId, line.serenataSongId);
      setItems((prev) => {
        const existing = prev.find((i) => i.lineId === lineId);
        if (existing) {
          const next = Math.min(
            existing.quantidade + qty,
            line.maxQuantity,
          );
          return prev.map((i) =>
            i.lineId === lineId
              ? { ...i, quantidade: next, maxQuantity: line.maxQuantity }
              : i,
          );
        }
        const displayNome =
          line.serenataSongTitulo
            ? `${line.nome} — ${line.serenataSongTitulo}`
            : line.nome;
        return [
          ...prev,
          {
            lineId,
            productId: line.productId,
            tipo: line.tipo,
            nome: displayNome,
            preco: line.preco,
            precoPromocional: line.precoPromocional ?? null,
            promoComboQuantidade: line.promoComboQuantidade ?? null,
            promoComboPreco: line.promoComboPreco ?? null,
            imagem_url: line.imagem_url,
            quantidade: Math.min(qty, line.maxQuantity),
            maxQuantity: line.maxQuantity,
            serenataSongId: line.serenataSongId,
            serenataSongTitulo: line.serenataSongTitulo,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((lineId: string, quantidade: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.lineId === lineId
            ? {
                ...i,
                quantidade: Math.max(
                  0,
                  Math.min(quantidade, i.maxQuantity),
                ),
              }
            : i,
        )
        .filter((i) => i.quantidade > 0),
    );
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  const lineAmount = useCallback(
    (line: CartLine) => cartLineAmount(line, items),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantidade, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      lineAmount,
      totalItems,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      lineAmount,
      totalItems,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
