import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export function CartSummary({ subtotal }: { subtotal: number }) {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary-soft/50 to-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Subtotal</span>
        <span className="text-base font-bold text-foreground">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Na próxima etapa você define para quem vai cada item, equipe, entrega
        ou retirada e horário.
      </p>
      <Link href="/checkout" className="btn-primary mt-5 flex w-full justify-center">
        Continuar
      </Link>
    </div>
  );
}
