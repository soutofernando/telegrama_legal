"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  ShoppingBag,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/context/cart-context";

const AtendimentoIcon: LucideIcon = MessageCircle;

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/loja", label: "Catálogo", icon: ShoppingBag },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart, showBadge: true },
  { href: "/atendimento", label: "Atendimento", icon: AtendimentoIcon },
] as const;

export function StoreBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegação principal"
    >
      <div className="mx-3 mb-2 rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-md">
        <ul className="flex items-stretch justify-around px-2">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={`relative flex w-full flex-col items-center px-1 pb-2 pt-2.5 ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  <span
                    className="mb-1.5 flex h-1 w-full items-center justify-center"
                    aria-hidden
                  >
                    {active && (
                      <span className="h-0.5 w-7 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <Icon
                      className="h-[1.375rem] w-[1.375rem]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    {"showBadge" in item && item.showBadge && totalItems > 0 && (
                      <span
                        data-cart-badge
                        className="absolute -right-2 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold leading-none text-white"
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold leading-tight">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
