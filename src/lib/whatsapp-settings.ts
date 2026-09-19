import type { CartLine } from "@/types/database";
import { formatCurrency } from "@/lib/format";
import { cartLinePricing, lineTotal } from "@/lib/product-pricing";

export const DEFAULT_WHATSAPP_MESSAGE_TEMPLATE = `Olá! Sou {{nome}}. Acabei de fazer um pedido no Telegrama Legal:

{{itens}}

Total: {{total}}

Envio o comprovante em anexo.`;

export const WHATSAPP_TEMPLATE_HINT =
  "Use {{nome}}, {{itens}} e {{total}} no texto. Eles serão substituídos automaticamente no pedido.";

export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatOrderItemsLines(items: CartLine[]): string {
  return items
    .map(
      (i) =>
        `• ${i.nome} x${i.quantidade} — ${formatCurrency(lineTotal(i.quantidade, cartLinePricing(i)))}`,
    )
    .join("\n");
}

export function renderWhatsAppMessage(
  template: string,
  params: { nome: string; itens: string; total: string },
): string {
  return template
    .replaceAll("{{nome}}", params.nome)
    .replaceAll("{{itens}}", params.itens)
    .replaceAll("{{total}}", params.total);
}

export function buildWhatsAppOrderUrl(
  number: string,
  template: string,
  nome: string,
  items: CartLine[],
  total: number,
): string | null {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) return null;
  const message = renderWhatsAppMessage(
    template.trim() || DEFAULT_WHATSAPP_MESSAGE_TEMPLATE,
    {
      nome,
      itens: formatOrderItemsLines(items),
      total: formatCurrency(total),
    },
  );
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
