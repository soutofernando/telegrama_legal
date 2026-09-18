import type { FulfillmentType } from "@/types/database";

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  delivery: "Entrega na equipe",
  pickup: "Retirada no balcão",
};

export const PICKUP_INSTRUCTIONS =
  process.env.NEXT_PUBLIC_PICKUP_LOCATION ??
  "Retire no balcão do Telegrama Legal no horário escolhido.";

export function fulfillmentSlotLabel(type: FulfillmentType): string {
  return type === "pickup" ? "Horário de retirada" : "Horário de entrega";
}
