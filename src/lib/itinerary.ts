import type { DeliverySlot, OrderItemWithRelations } from "@/types/database";

export const ITINERARY_TIMEZONE = "America/Sao_Paulo";

function ymdInTimezone(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ITINERARY_TIMEZONE,
  }).format(date);
}

/** Data do itinerário: mesmo dia civil da compra (fuso São Paulo). */
export function getItineraryDateKey(createdAtIso: string): string {
  return ymdInTimezone(new Date(createdAtIso));
}

export function getTodayItineraryKey(): string {
  return ymdInTimezone(new Date());
}

function dateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Ex.: 19/09/2026 */
export function formatItineraryDateShort(ymd: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ITINERARY_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateFromYmd(ymd));
}

/** Ex.: sexta-feira, 19 de setembro de 2026 */
export function formatItineraryDateLabel(ymd: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: ITINERARY_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateFromYmd(ymd));
}

export function isDeliveryItem(item: OrderItemWithRelations): boolean {
  return (item.fulfillment_type ?? "delivery") === "delivery";
}

export function isActiveItineraryStatus(status: string): boolean {
  return status === "pending" || status === "in_progress";
}

export function itemsForItineraryDay(
  items: OrderItemWithRelations[],
  dayKey: string,
): OrderItemWithRelations[] {
  return items.filter(
    (item) =>
      isDeliveryItem(item) && getItineraryDateKey(item.criado_em) === dayKey,
  );
}

/** Datas (AAAA-MM-DD) que possuem entregas, em ordem cronológica. */
export function collectItineraryDayKeys(
  items: OrderItemWithRelations[],
): string[] {
  const keys = new Set<string>();
  for (const item of items) {
    if (!isDeliveryItem(item)) continue;
    keys.add(getItineraryDateKey(item.criado_em));
  }
  return Array.from(keys).sort();
}

export function sortSlots(slots: DeliverySlot[]): DeliverySlot[] {
  return [...slots].sort((a, b) => a.sort_order - b.sort_order);
}

export function slotSortOrder(
  slotId: string,
  slots: DeliverySlot[],
): number {
  const slot = slots.find((s) => s.id === slotId);
  return slot?.sort_order ?? 9999;
}
