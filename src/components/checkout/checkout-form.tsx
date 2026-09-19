"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { placeOrderAction } from "@/app/actions/checkout";
import { formatCurrency } from "@/lib/format";
import { TeamSelect } from "@/components/ui/team-select";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp-settings";
import {
  FULFILLMENT_LABELS,
  PICKUP_INSTRUCTIONS,
  fulfillmentSlotLabel,
} from "@/lib/fulfillment";
import {
  buildCheckoutItemsFromUnits,
  syncLineUnits,
  validateLineUnits,
  type LineUnitRecipient,
} from "@/lib/checkout-recipients";
import { OrderItemsRecipients } from "@/components/checkout/order-items-recipients";
import { PixCheckoutPanel } from "@/components/checkout/pix-checkout-panel";
import { isPixConfigured } from "@/lib/pix-settings";
import type {
  AppSettings,
  DeliverySlot,
  FulfillmentType,
  PaymentMethod,
  Team,
} from "@/types/database";

export function CheckoutForm({
  teams,
  slots,
  whatsapp,
}: {
  teams: Team[];
  slots: DeliverySlot[];
  whatsapp: AppSettings;
}) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("on_delivery");
  const [lineUnits, setLineUnits] = useState<
    Record<string, LineUnitRecipient[]>
  >({});
  const [pixPaid, setPixPaid] = useState(false);

  useEffect(() => {
    setLineUnits((prev) => syncLineUnits(items, prev));
  }, [items]);

  useEffect(() => {
    if (payment !== "whatsapp") setPixPaid(false);
  }, [payment]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!items.length) {
      setError("Seu carrinho está vazio.");
      return;
    }
    if (!equipeId) {
      setError("Selecione sua equipe.");
      return;
    }
    if (!slotId) {
      setError(
        fulfillment === "pickup"
          ? "Selecione o horário de retirada."
          : "Selecione o horário de entrega.",
      );
      return;
    }

    const recipientError = validateLineUnits(items, lineUnits);
    if (recipientError) {
      setError(recipientError);
      return;
    }

    if (payment === "whatsapp") {
      if (!isPixConfigured(whatsapp)) {
        setError(
          "Pagamento por PIX ainda não está configurado. Escolha outra forma de pagamento.",
        );
        return;
      }
      if (!pixPaid) {
        setError("Marque que você já realizou o pagamento via PIX.");
        return;
      }
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        nomeComprador: nome,
        equipeId,
        deliverySlotId: slotId,
        fulfillmentType: fulfillment,
        paymentMethod: payment,
        items: buildCheckoutItemsFromUnits(items, lineUnits),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clearCart();

      if (payment === "whatsapp") {
        const url = buildWhatsAppOrderUrl(
          whatsapp.whatsapp_number,
          whatsapp.whatsapp_message_template,
          nome,
          items,
          subtotal,
        );
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }

      router.push(`/pedido-confirmado?id=${result.orderId}`);
    });
  };

  if (!items.length) {
    return (
      <p className="text-neutral-600">
        Seu carrinho está vazio.{" "}
        <a href="/loja" className="font-medium text-ecri-blue underline">
          Ver catálogo
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="rounded-3xl border border-border bg-card p-4 text-sm shadow-sm">
        <p className="font-semibold text-neutral-900">Resumo</p>
        <ul className="mt-2 space-y-1 text-neutral-600">
          {items.map((i) => (
            <li key={i.lineId}>
              {i.nome} × {i.quantidade}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-base font-bold text-ecri-blue">
          Total: {formatCurrency(subtotal)}
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nome do comprador
          </label>
          <input
            required
            autoComplete="name"
            enterKeyHint="next"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-field"
            placeholder="Seu nome"
          />
        </div>
        <TeamSelect
          label="Sua equipe"
          teams={teams}
          value={equipeId}
          onChange={setEquipeId}
          required
        />

        <OrderItemsRecipients
          items={items}
          teams={teams}
          lineUnits={lineUnits}
          onChangeUnits={(lineId, units) =>
            setLineUnits((prev) => ({ ...prev, [lineId]: units }))
          }
        />

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-neutral-900">
            Como você quer receber?
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["delivery", "pickup"] as FulfillmentType[]).map((type) => {
              const active = fulfillment === type;
              return (
                <label
                  key={type}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                    active
                      ? "border-ecri-blue bg-ecri-blue/5"
                      : "border-neutral-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={active}
                    onChange={() => setFulfillment(type)}
                    className="mt-1 h-5 w-5 accent-ecri-blue"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-neutral-900">
                      {FULFILLMENT_LABELS[type]}
                    </span>
                    <span className="mt-0.5 block text-neutral-500">
                      {type === "delivery"
                        ? "Levamos até a equipe indicada no horário escolhido."
                        : PICKUP_INSTRUCTIONS}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            {fulfillmentSlotLabel(fulfillment)}
          </label>
          <select
            required
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione…</option>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>{s.horario}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">
            Forma de pagamento
          </p>
          <div className="space-y-2">
            <label
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                payment === "whatsapp"
                  ? "border-ecri-blue bg-ecri-blue/5"
                  : "border-neutral-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === "whatsapp"}
                onChange={() => setPayment("whatsapp")}
                className="mt-1 h-5 w-5 accent-ecri-blue"
              />
              <span className="text-sm">
                <span className="font-semibold text-neutral-900">Pagar agora</span>
                <span className="mt-0.5 block text-neutral-500">
                  Pague com PIX (QR ou copia e cola) e depois envie o comprovante
                  no WhatsApp.
                </span>
              </span>
            </label>
            <label
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                payment === "on_delivery"
                  ? "border-ecri-blue bg-ecri-blue/5"
                  : "border-neutral-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === "on_delivery"}
                onChange={() => setPayment("on_delivery")}
                className="mt-1 h-5 w-5 accent-ecri-blue"
              />
              <span className="text-sm">
                <span className="font-semibold text-neutral-900">
                  {fulfillment === "pickup"
                    ? "Pagar na retirada"
                    : "Pagar na entrega"}
                </span>
                <span className="mt-0.5 block text-neutral-500">
                  O pagamento é feito quando você receber o item. Aparece no
                  itinerário como pendente.
                </span>
              </span>
            </label>
            <label
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
                payment === "vendor_paid"
                  ? "border-ecri-blue bg-ecri-blue/5"
                  : "border-neutral-100"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={payment === "vendor_paid"}
                onChange={() => setPayment("vendor_paid")}
                className="mt-1 h-5 w-5 accent-ecri-blue"
              />
              <span className="text-sm">
                <span className="font-semibold text-neutral-900">
                  Pago agora! (VENDEDOR)
                </span>
                <span className="mt-0.5 block text-neutral-500">
                  Venda presencial com o vendedor. O item já é registrado como
                  entregue.
                </span>
              </span>
            </label>
          </div>
        </div>

        {payment === "whatsapp" && (
          <PixCheckoutPanel
            settings={whatsapp}
            amount={subtotal}
            confirmed={pixPaid}
            onConfirmedChange={setPixPaid}
          />
        )}
      </div>

      {error && (
        <p className="rounded-2xl bg-ecri-red/10 px-4 py-3 text-sm font-medium text-ecri-red">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending
          ? "Confirmando…"
          : payment === "whatsapp"
            ? "Confirmar pedido e enviar comprovante"
            : "Confirmar pedido"}
      </button>
    </form>
  );
}
