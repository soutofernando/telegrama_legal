import { CalendarClock, Gift, Music2, Package, User, Users } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { OrderItemWithRelations } from "@/types/database";

function DestinoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="text-base font-bold leading-snug text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function giftKindLabel(item: OrderItemWithRelations): string | null {
  const tipo = item.products?.tipo;
  if (tipo === "serenata") return "Serenata";
  if (tipo === "prenda") return "Prenda";
  if (item.eh_presente) return "Presente";
  return null;
}

export function ItemDestinoDetail({ item }: { item: OrderItemWithRelations }) {
  const equipe = item.teams?.nome?.trim() || "—";
  const nome = item.nome_recebedor.trim() || "—";
  const kind = giftKindLabel(item);
  const isGift = Boolean(kind);

  return (
    <div className="space-y-3">
      {kind && (
        <span
          className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold text-amber-950"
        >
          {item.products?.tipo === "serenata" ? (
            <Music2 className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Gift className="h-3.5 w-3.5" aria-hidden />
          )}
          {kind}
          {isGift ? " · para outra pessoa" : ""}
        </span>
      )}

      <DestinoRow icon={User} label="Quem recebe" value={nome} />
      <DestinoRow icon={Users} label="Equipe destino" value={equipe} />

      {item.products?.nome && (
        <div className="flex items-start gap-3 border-t border-border/60 pt-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-muted"
            aria-hidden
          >
            <Package className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              Item
            </p>
            <p className="text-sm font-semibold text-foreground">
              {item.products.nome}
              <span className="font-medium text-muted">
                {" "}
                · {item.quantidade} un.
              </span>
            </p>
          </div>
        </div>
      )}

      <DestinoRow
        icon={CalendarClock}
        label="Data da compra"
        value={formatDateTime(item.criado_em)}
      />
    </div>
  );
}
