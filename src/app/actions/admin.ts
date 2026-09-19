"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type AdminActionResult,
  fkBlockMessage,
} from "@/lib/admin-action-result";
import { STORAGE_BUCKET } from "@/lib/constants";
import { productImagePathFromUrl } from "@/lib/product-storage";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp-settings";
import type { ProductKind } from "@/types/database";
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return supabase;
}

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/loja");
  revalidatePath("/loja/[id]", "page");
}

function revalidateAfterProductDelete() {
  revalidateCatalog();
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/itens");
  revalidatePath("/admin/itinerario");
  revalidatePath("/admin/financeiro");
}

function isMissingRpc(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "PGRST202" ||
    (error.message?.includes("delete_product_cascade") ?? false) ||
    (error.message?.includes("Could not find the function") ?? false)
  );
}

async function deleteProductCascade(
  admin: ReturnType<typeof createAdminClient>,
  productId: string,
): Promise<void> {
  const { error: rpcError } = await admin.rpc("delete_product_cascade", {
    p_product_id: productId,
  });
  if (!rpcError) return;
  if (!isMissingRpc(rpcError)) throw rpcError;

  const { data: linkedItems, error: listErr } = await admin
    .from("order_items")
    .select("order_id")
    .eq("product_id", productId);
  if (listErr) throw listErr;

  const orderIds = [
    ...new Set((linkedItems ?? []).map((row) => row.order_id as string)),
  ];

  const { error: delItemsErr } = await admin
    .from("order_items")
    .delete()
    .eq("product_id", productId);
  if (delItemsErr) throw delItemsErr;

  for (const orderId of orderIds) {
    const { count, error: countErr } = await admin
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId);
    if (countErr) throw countErr;
    if (count === 0) {
      const { error: orderErr } = await admin
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (orderErr) throw orderErr;
    }
  }

  const { error: delProductErr } = await admin
    .from("products")
    .delete()
    .eq("id", productId);
  if (delProductErr) throw delProductErr;
}

export async function upsertTeam(id: string | null, nome: string) {
  await requireAuth();
  const admin = createAdminClient();
  if (id) {
    const { error } = await admin.from("teams").update({ nome }).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await admin.from("teams").insert({ nome });
    if (error) throw error;
  }
  revalidatePath("/admin/equipes");
}

export async function deleteTeam(id: string): Promise<AdminActionResult> {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.from("teams").delete().eq("id", id);
  if (error) {
    const msg = fkBlockMessage(error.code);
    if (msg) {
      return {
        success: false,
        error:
          "Esta equipe está vinculada a pedidos ou entregas e não pode ser removida.",
      };
    }
    throw error;
  }
  revalidatePath("/admin/equipes");
  return { success: true };
}

export async function saveTeamCrud(
  id: string | null,
  values: Record<string, string>,
) {
  await upsertTeam(id, values.nome);
}

export async function upsertDeliverySlot(
  id: string | null,
  horario: string,
  sortOrder: number,
) {
  await requireAuth();
  const admin = createAdminClient();
  if (id) {
    const { error } = await admin
      .from("delivery_slots")
      .update({ horario, sort_order: sortOrder })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await admin
      .from("delivery_slots")
      .insert({ horario, sort_order: sortOrder });
    if (error) throw error;
  }
  revalidatePath("/admin/horarios");
}

export async function deleteDeliverySlot(
  id: string,
): Promise<AdminActionResult> {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.from("delivery_slots").delete().eq("id", id);
  if (error) {
    const msg = fkBlockMessage(error.code);
    if (msg) {
      return {
        success: false,
        error:
          "Este horário está vinculado a pedidos e não pode ser removido.",
      };
    }
    throw error;
  }
  revalidatePath("/admin/horarios");
  return { success: true };
}

export async function saveDeliverySlotCrud(
  id: string | null,
  values: Record<string, string>,
) {
  await upsertDeliverySlot(
    id,
    values.horario,
    Number(values.sort_order || 0),
  );
}

function nullableNumber(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return value;
}

export async function upsertProduct(data: {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  estoque: number;
  tipo: ProductKind;
  preco_promocional?: number | null;
  promo_combo_quantidade?: number | null;
  promo_combo_preco?: number | null;
}) {
  await requireAuth();
  const admin = createAdminClient();
  const promoFields = {
    preco_promocional: nullableNumber(data.preco_promocional),
    promo_combo_quantidade: nullableNumber(data.promo_combo_quantidade),
    promo_combo_preco: nullableNumber(data.promo_combo_preco),
  };
  if (data.id) {
    const { error } = await admin
      .from("products")
      .update({
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imagem_url: data.imagem_url,
        estoque: data.estoque,
        tipo: data.tipo,
        ...promoFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
  } else {
    const { error } = await admin.from("products").insert({
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      imagem_url: data.imagem_url,
      estoque: data.estoque,
      tipo: data.tipo,
      ...promoFields,
    });
    if (error) throw error;
  }
  revalidateCatalog();
}

export async function upsertSerenataSong(
  id: string | null,
  titulo: string,
  sortOrder: number,
) {
  await requireAuth();
  const admin = createAdminClient();
  if (id) {
    const { error } = await admin
      .from("serenata_songs")
      .update({ titulo, sort_order: sortOrder })
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await admin
      .from("serenata_songs")
      .insert({ titulo, sort_order: sortOrder });
    if (error) throw error;
  }
  revalidatePath("/admin/serenatas");
  revalidatePath("/loja/[id]", "page");
}

export async function deleteSerenataSong(
  id: string,
): Promise<AdminActionResult> {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.from("serenata_songs").delete().eq("id", id);
  if (error) {
    const msg = fkBlockMessage(error.code);
    if (msg) {
      return {
        success: false,
        error:
          "Esta música está vinculada a pedidos e não pode ser removida.",
      };
    }
    throw error;
  }
  revalidatePath("/admin/serenatas");
  revalidatePath("/loja/[id]", "page");
  return { success: true };
}

export async function saveSerenataSongCrud(
  id: string | null,
  values: Record<string, string>,
) {
  await upsertSerenataSong(
    id,
    values.titulo,
    Number(values.sort_order || 0),
  );
}

export async function deleteProduct(id: string): Promise<AdminActionResult> {
  await requireAuth();
  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from("products")
    .select("imagem_url")
    .eq("id", id)
    .maybeSingle();
  if (productError) throw productError;
  if (!product) {
    return { success: false, error: "Produto não encontrado." };
  }

  try {
    await deleteProductCascade(admin, id);
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code)
        : undefined;
    const msg = fkBlockMessage(code);
    if (msg) {
      return {
        success: false,
        error:
          "Não foi possível remover o produto. Tente novamente ou aplique as migrations do Supabase.",
      };
    }
    throw err;
  }

  const storagePath = productImagePathFromUrl(product.imagem_url);
  if (storagePath) {
    await admin.storage.from(STORAGE_BUCKET).remove([storagePath]);
  }

  revalidateAfterProductDelete();
  return { success: true };
}

export async function upsertOrderItemManual(data: {
  id?: string;
  nome_recebedor: string;
  equipe_destino_id: string;
  delivery_slot_id: string;
  product_id: string;
  quantidade: number;
  status: "pending" | "delivered";
}) {
  await requireAuth();
  const admin = createAdminClient();

  if (data.id) {
    const { error } = await admin
      .from("order_items")
      .update({
        nome_recebedor: data.nome_recebedor,
        equipe_destino_id: data.equipe_destino_id,
        delivery_slot_id: data.delivery_slot_id,
        product_id: data.product_id,
        quantidade: data.quantidade,
        status: data.status,
      })
      .eq("id", data.id);
    if (error) throw error;
  } else {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        nome_comprador: data.nome_recebedor,
        equipe_id: data.equipe_destino_id,
        forma_pagamento: "on_delivery",
        delivery_slot_id: data.delivery_slot_id,
      })
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error } = await admin.from("order_items").insert({
      order_id: order.id,
      nome_recebedor: data.nome_recebedor,
      equipe_destino_id: data.equipe_destino_id,
      delivery_slot_id: data.delivery_slot_id,
      product_id: data.product_id,
      quantidade: data.quantidade,
      status: data.status,
      eh_presente: true,
    });
    if (error) throw error;
  }
  revalidatePath("/admin/itens");
  revalidatePath("/admin/itinerario");
}

export async function deleteOrderItem(id: string) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.from("order_items").delete().eq("id", id);
  if (error) throw error;
}

export async function setOrderItemStatus(
  id: string,
  status: "pending" | "in_progress" | "delivered",
) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin
    .from("order_items")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/itens");
  revalidatePath("/admin/itinerario");
}

export async function setOrderItemsStatus(
  ids: string[],
  status: "pending" | "in_progress" | "delivered",
) {
  if (ids.length === 0) return;
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.rpc("set_order_items_status", {
    p_ids: ids,
    p_status: status,
  });
  if (error) throw error;
  revalidatePath("/admin/itens");
  revalidatePath("/admin/itinerario");
}

export async function markGroupDelivered(
  equipeId: string,
  deliverySlotId: string,
) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.rpc("mark_delivery_group_delivered", {
    p_equipe_id: equipeId,
    p_delivery_slot_id: deliverySlotId,
  });
  if (error) throw error;
  revalidatePath("/admin/itens");
  revalidatePath("/admin/itinerario");
}

export async function saveAppSettings(data: {
  whatsapp_number: string;
  whatsapp_message_template: string;
  pix_key: string;
  pix_merchant_name: string;
  pix_merchant_city: string;
}) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin.from("app_settings").upsert({
    id: "default",
    whatsapp_number: normalizeWhatsAppNumber(data.whatsapp_number),
    whatsapp_message_template: data.whatsapp_message_template.trim(),
    pix_key: data.pix_key.trim(),
    pix_merchant_name: data.pix_merchant_name.trim(),
    pix_merchant_city: data.pix_merchant_city.trim(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  revalidatePath("/checkout");
  revalidatePath("/admin/configuracoes");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
