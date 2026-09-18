"use client";

import {
  Ellipsis,
  Home,
  LayoutGrid,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_PRIMARY_NAV } from "@/lib/admin-nav";
import { AdminMoreSheet } from "@/components/admin/admin-more-sheet";

const NAV_ICONS: Record<string, LucideIcon> = {
  Início: Home,
  Equipes: Users,
  Itens: LayoutGrid,
  Produtos: ShoppingBag,
  Mais: Ellipsis,
};

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const Icon = NAV_ICONS[name] ?? Ellipsis;
  return (
    <Icon
      className="h-6 w-6"
      strokeWidth={active ? 2.25 : 1.75}
      aria-hidden
    />
  );
}

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive =
    pathname.startsWith("/admin/financeiro") ||
    pathname.startsWith("/admin/horarios") ||
    pathname.startsWith("/admin/itinerario");

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Admin mobile"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around">
          {ADMIN_PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href, item.match);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold transition-colors ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  <NavIcon name={item.label} active={active} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={`flex min-h-[3.35rem] w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold transition-colors ${
                moreActive ? "text-primary" : "text-muted"
              }`}
            >
              <NavIcon name="Mais" active={moreActive} />
              <span>Mais</span>
            </button>
          </li>
        </ul>
      </nav>
      <AdminMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
