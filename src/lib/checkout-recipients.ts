import { isGiftProductKind, giftRecipientPrompt } from "@/lib/gift-product";
import type { CartLine, CheckoutPayload } from "@/types/database";

export type RecipientMode = "self" | "other";

export type LineUnitRecipient = {
  mode: RecipientMode;
  nomeRecebedor: string;
  equipeDestinoId: string;
};

export function defaultUnitForLine(line: CartLine): LineUnitRecipient {
  if (isGiftProductKind(line.tipo)) {
    return { mode: "other", nomeRecebedor: "", equipeDestinoId: "" };
  }
  return { mode: "self", nomeRecebedor: "", equipeDestinoId: "" };
}

export function syncLineUnits(
  items: CartLine[],
  prev: Record<string, LineUnitRecipient[]>,
): Record<string, LineUnitRecipient[]> {
  const next: Record<string, LineUnitRecipient[]> = {};
  for (const line of items) {
    const existing = prev[line.lineId] ?? [];
    const units: LineUnitRecipient[] = [];
    for (let i = 0; i < line.quantidade; i++) {
      units.push(existing[i] ?? defaultUnitForLine(line));
    }
    next[line.lineId] = units;
  }
  return next;
}

export function lineRequiresRecipient(
  line: CartLine,
  unit: LineUnitRecipient,
): boolean {
  return isGiftProductKind(line.tipo) || unit.mode === "other";
}

export function recipientSummary(
  line: CartLine,
  units: LineUnitRecipient[],
): string {
  if (isGiftProductKind(line.tipo)) {
    const u = units[0];
    if (!u?.nomeRecebedor.trim()) return "Informe o destinatário";
    return u.nomeRecebedor.trim();
  }
  const self = units.filter((u) => u.mode === "self").length;
  const other = units.length - self;
  if (other === 0) return self === 1 ? "Para você" : `Todos para você (${self})`;
  if (self === 0) {
    return other === 1 ? "1 presente" : `${other} presentes`;
  }
  return `${self} para você · ${other} presente${other > 1 ? "s" : ""}`;
}

export { giftRecipientPrompt };

export function validateLineUnits(
  items: CartLine[],
  lineUnits: Record<string, LineUnitRecipient[]>,
): string | null {
  for (const line of items) {
    const units = lineUnits[line.lineId] ?? [];
    if (units.length !== line.quantidade) {
      return `Atualize os destinatários de ${line.nome}.`;
    }
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (!lineRequiresRecipient(line, unit)) continue;
      const label = isGiftProductKind(line.tipo)
        ? giftRecipientPrompt(line.tipo)
        : `${line.nome} (unidade ${i + 1})`;
      if (!unit.nomeRecebedor.trim()) {
        return `Informe para quem vai: ${label}.`;
      }
      if (!unit.equipeDestinoId) {
        return `Selecione a equipe de destino: ${label}.`;
      }
    }
  }
  return null;
}

export function buildCheckoutItemsFromUnits(
  items: CartLine[],
  lineUnits: Record<string, LineUnitRecipient[]>,
): CheckoutPayload["items"] {
  const expanded: CheckoutPayload["items"] = [];

  for (const line of items) {
    const units = lineUnits[line.lineId] ?? [];
    for (const unit of units) {
      const presente =
        isGiftProductKind(line.tipo) || unit.mode === "other";
      expanded.push({
        productId: line.productId,
        quantidade: 1,
        serenataSongId: line.serenataSongId,
        presente,
        nomeRecebedor: presente ? unit.nomeRecebedor.trim() : undefined,
        equipeDestinoId: presente ? unit.equipeDestinoId : undefined,
      });
    }
  }

  const grouped = new Map<string, CheckoutPayload["items"][number]>();
  for (const item of expanded) {
    const key = [
      item.productId,
      item.serenataSongId ?? "",
      item.presente ? "1" : "0",
      item.nomeRecebedor ?? "",
      item.equipeDestinoId ?? "",
    ].join("|");
    const hit = grouped.get(key);
    if (hit) hit.quantidade += 1;
    else grouped.set(key, { ...item });
  }
  return [...grouped.values()];
}
