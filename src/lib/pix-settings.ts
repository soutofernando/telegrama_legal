import { createStaticPix, hasError } from "pix-utils";
import type { AppSettings } from "@/types/database";

function trimPixField(value: string, maxLen: number): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .slice(0, maxLen);
}

export function isPixConfigured(settings: AppSettings): boolean {
  return Boolean(
    settings.pix_key.trim() &&
      settings.pix_merchant_name.trim() &&
      settings.pix_merchant_city.trim(),
  );
}

export function createOrderPix(settings: AppSettings, amount: number) {
  if (!isPixConfigured(settings) || amount <= 0) return null;

  const pix = createStaticPix({
    merchantName: trimPixField(settings.pix_merchant_name, 25),
    merchantCity: trimPixField(settings.pix_merchant_city, 15),
    pixKey: settings.pix_key.trim(),
    transactionAmount: Math.round(amount * 100) / 100,
    infoAdicional: "Telegrama Legal",
  });

  if (hasError(pix)) return null;
  return pix;
}

export function buildPixCopyPaste(
  settings: AppSettings,
  amount: number,
): string | null {
  const pix = createOrderPix(settings, amount);
  return pix?.toBRCode() ?? null;
}
