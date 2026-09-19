"use client";

import {
  Clock,
  ExternalLink,
  LogOut,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions/admin";
import { ADMIN_MOBILE_MORE_LINKS } from "@/lib/admin-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";

const MORE_ICONS: Record<string, LucideIcon> = {
  "/admin/financeiro": Wallet,
  "/admin/horarios": Clock,
  "/admin/equipes": Users,
  "/admin/configuracoes": Settings,
  "/": ExternalLink,
};

export function AdminMoreSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Mais opções">
      <ul className="space-y-2">
        {ADMIN_MOBILE_MORE_LINKS.map((link) => {
          const Icon = MORE_ICONS[link.href] ?? ExternalLink;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex min-h-14 items-center gap-3 rounded-2xl bg-background px-4 py-3 transition-colors active:bg-primary-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    {link.label}
                  </span>
                  <span className="text-sm text-muted">{link.desc}</span>
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-left transition-colors active:opacity-90"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <LogOut className="h-5 w-5" strokeWidth={2} />
              </span>
              <span>
                <span className="block font-semibold text-accent">
                  Sair da conta
                </span>
                <span className="text-sm text-accent/80">
                  Encerrar sessão admin
                </span>
              </span>
            </button>
          </form>
        </li>
      </ul>
    </BottomSheet>
  );
}
