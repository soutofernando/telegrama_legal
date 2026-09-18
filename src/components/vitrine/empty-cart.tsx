import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="font-display mt-4 text-lg font-extrabold text-foreground">
        Seu carrinho está esperando
      </h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        por uma lembrança especial do ECRI.
      </p>
      <Link href="/loja" className="btn-primary mt-6 w-full max-w-xs">
        Ver catálogo
      </Link>
    </div>
  );
}
