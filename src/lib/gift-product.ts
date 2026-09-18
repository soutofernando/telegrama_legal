import type { ProductKind } from "@/types/database";

export function isGiftProductKind(tipo: ProductKind | undefined): boolean {
  return tipo === "prenda" || tipo === "serenata";
}

export function giftRecipientPrompt(tipo: ProductKind | undefined): string {
  if (tipo === "serenata") return "Para quem vai a serenata";
  if (tipo === "prenda") return "Para quem vai a prenda";
  return "Para quem vai o presente";
}

/** Ex.: Prenda para Maria da equipe Coração */
export function formatPrendaDestino(
  nomeRecebedor: string,
  equipeNome: string,
): string {
  const nome = nomeRecebedor.trim();
  const equipe = equipeNome.trim();
  if (!nome) return equipe ? `Prenda para a equipe ${equipe}` : "Prenda";
  if (!equipe) return `Prenda para ${nome}`;
  return `Prenda para ${nome} da equipe ${equipe}`;
}
