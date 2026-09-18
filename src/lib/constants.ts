/** ISR do catálogo (segundos). Ajuste aqui ou via revalidatePath no admin. */
export const CATALOG_REVALIDATE = 60;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Telegrama Legal";

export const STORAGE_BUCKET = "products";
