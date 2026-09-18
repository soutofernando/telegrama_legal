/** ISR do catálogo (segundos). Espelha `export const revalidate = 60` nas páginas da vitrine. */
export const CATALOG_REVALIDATE_SECONDS = 60;

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME ?? "Telegrama Legal";

export const STORAGE_BUCKET = "products";
