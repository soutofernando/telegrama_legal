"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutPayload } from "@/types/database";

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function placeOrderAction(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  try {
    const supabase = createAdminClient();

    const itemsJson = payload.items.map((i) => ({
      product_id: i.productId,
      quantidade: i.quantidade,
      serenata_song_id: i.serenataSongId ?? null,
      eh_presente: Boolean(i.presente),
      nome_recebedor: i.presente ? i.nomeRecebedor?.trim() || null : null,
      equipe_destino_id: i.presente ? i.equipeDestinoId || null : null,
    }));

    const { data, error } = await supabase.rpc("place_order", {
      p_nome_comprador: payload.nomeComprador,
      p_equipe_id: payload.equipeId,
      p_forma_pagamento: payload.paymentMethod,
      p_delivery_slot_id: payload.deliverySlotId,
      p_items: itemsJson,
      p_fulfillment_type: payload.fulfillmentType,
    });

    if (error) {
      const msg = error.message.includes("Estoque insuficiente")
        ? "Estoque insuficiente para um ou mais itens. Atualize o carrinho e tente novamente."
        : error.message;
      return { ok: false, error: msg };
    }

    revalidatePath("/");
    revalidatePath("/loja");
    revalidatePath("/loja/[id]", "page");

    return { ok: true, orderId: data as string };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao finalizar pedido",
    };
  }
}
