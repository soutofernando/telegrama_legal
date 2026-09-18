import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function OrderSuccess({ orderId }: { orderId?: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-10 text-center sm:py-12">
      <CheckCircle2
        className="mx-auto h-16 w-16 text-primary"
        strokeWidth={1.5}
        aria-hidden
      />
      <h1 className="font-display mt-5 text-2xl font-extrabold text-foreground">
        Pedido confirmado!
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
        Agora é só esperar o seu momento no ECRI. Sua lembrança foi registrada
        para entrega no encontro.
      </p>
      {orderId && (
        <p className="mt-4 rounded-2xl bg-background px-3 py-3 font-mono text-xs text-muted">
          {orderId}
        </p>
      )}
      <Link href="/loja" className="btn-primary mt-6 inline-flex">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
