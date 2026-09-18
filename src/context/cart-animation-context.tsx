"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface FlyPayload {
  imageUrl: string;
  fromRect: DOMRect;
}

interface CartAnimationContextValue {
  badgePulse: number;
  toastMessage: string | null;
  flyToCart: (payload: FlyPayload) => void;
  clearToast: () => void;
}

const CartAnimationContext = createContext<CartAnimationContextValue | null>(
  null,
);

export function CartAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [badgePulse, setBadgePulse] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fly, setFly] = useState<{
    id: number;
    imageUrl: string;
    style: React.CSSProperties;
  } | null>(null);

  const clearToast = useCallback(() => setToastMessage(null), []);

  const flyToCart = useCallback((payload: FlyPayload) => {
    setBadgePulse((n) => n + 1);
    setToastMessage("Adicionado ao carrinho ✓");
    window.setTimeout(() => setToastMessage(null), 2200);

    if (prefersReducedMotion()) return;

    const badge = document.querySelector<HTMLElement>("[data-cart-badge]");
    const toRect = badge?.getBoundingClientRect();
    const from = payload.fromRect;
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const endX = toRect
      ? toRect.left + toRect.width / 2
      : window.innerWidth - 48;
    const endY = toRect ? toRect.top + toRect.height / 2 : window.innerHeight - 40;

    const id = Date.now();
    setFly({
      id,
      imageUrl: payload.imageUrl,
      style: {
        position: "fixed",
        left: startX,
        top: startY,
        width: Math.min(from.width, 72),
        height: Math.min(from.height, 72),
        transform: "translate(-50%, -50%)",
      },
    });

    void import("gsap").then((gsapMod) => {
      const el = document.querySelector(`[data-fly-id="${id}"]`);
      if (!el) return;
      gsapMod.default.to(el, {
        left: endX,
        top: endY,
        width: 28,
        height: 28,
        opacity: 0.15,
        duration: 0.55,
        ease: "power2.in",
        onComplete: () => setFly((current) => (current?.id === id ? null : current)),
      });
    });

    if (badge) {
      void import("gsap").then((gsapMod) => {
        gsapMod.default.fromTo(
          badge,
          { scale: 1 },
          { scale: 1.28, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" },
        );
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      badgePulse,
      toastMessage,
      flyToCart,
      clearToast,
    }),
    [badgePulse, toastMessage, flyToCart, clearToast],
  );

  return (
    <CartAnimationContext.Provider value={value}>
      {children}
      {fly && (
        <div
          className="pointer-events-none fixed z-[100] overflow-hidden rounded-xl border-2 border-white shadow-lg"
          data-fly-id={fly.id}
          style={fly.style}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fly.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {toastMessage && (
        <div
          className="pointer-events-none fixed left-1/2 top-20 z-[100] -translate-x-1/2 animate-fade-in rounded-full bg-neutral-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg md:top-24"
          role="status"
        >
          {toastMessage}
        </div>
      )}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const ctx = useContext(CartAnimationContext);
  if (!ctx) {
    throw new Error("useCartAnimation must be used within CartAnimationProvider");
  }
  return ctx;
}
