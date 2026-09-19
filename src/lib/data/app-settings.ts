import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_WHATSAPP_MESSAGE_TEMPLATE,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp-settings";
import type { AppSettings } from "@/types/database";

const SETTINGS_ID = "default";

function envFallbackNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
}

export async function getAppSettings(): Promise<AppSettings> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .select(
      "whatsapp_number, whatsapp_message_template, pix_key, pix_merchant_name, pix_merchant_city, updated_at",
    )
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("app_settings")) {
      return {
        whatsapp_number: envFallbackNumber(),
        whatsapp_message_template: DEFAULT_WHATSAPP_MESSAGE_TEMPLATE,
        pix_key: "",
        pix_merchant_name: "",
        pix_merchant_city: "",
      };
    }
    throw error;
  }

  const number =
    normalizeWhatsAppNumber(data?.whatsapp_number ?? "") || envFallbackNumber();
  const template =
    data?.whatsapp_message_template?.trim() ||
    DEFAULT_WHATSAPP_MESSAGE_TEMPLATE;

  return {
    whatsapp_number: number,
    whatsapp_message_template: template,
    pix_key: data?.pix_key?.trim() ?? "",
    pix_merchant_name: data?.pix_merchant_name?.trim() ?? "",
    pix_merchant_city: data?.pix_merchant_city?.trim() ?? "",
    updated_at: data?.updated_at,
  };
}
