"use client";

import {
  Clock,
  Home,
  LayoutGrid,
  LogOut,
  MapPin,
  ShoppingBag,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/admin";
import { ADMIN_DESKTOP_LINKS } from "@/lib/admin-nav";

const DESKTOP_NAV_ICONS: Record<string, LucideIcon> = {
  "/admin": Home,
  "/admin/equipes": Users,
  "/admin/itens": LayoutGrid,
  "/admin/produtos": ShoppingBag,
  "/admin/financeiro": Wallet,
  "/admin/horarios": Clock,
  "/admin/itinerario": MapPin,
};

export function AdminDesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="border-b border-border p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <img
            src="/ecri.jpg"
            alt="ECRI"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-bold text-foreground">Encontro</p>
            <p className="text-xs text-muted">Painel admin</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Admin desktop">
        {ADMIN_DESKTOP_LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          const Icon = DESKTOP_NAV_ICONS[link.href] ?? Home;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={active ? 2.25 : 1.75}
                aria-hidden
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-muted transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
