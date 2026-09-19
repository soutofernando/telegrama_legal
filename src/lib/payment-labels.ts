import type { PaymentMethod } from "@/types/database";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  whatsapp: "Pagar agora",
  on_delivery: "Pagar na entrega",
  vendor_paid: "Pago agora! (VENDEDOR)",
};
