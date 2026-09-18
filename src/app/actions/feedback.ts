"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackStatus, SubmitFeedbackPayload } from "@/types/database";

export type SubmitFeedbackResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function submitFeedbackAction(
  payload: SubmitFeedbackPayload,
): Promise<SubmitFeedbackResult> {
  const nome = payload.nome.trim();
  const assunto = payload.assunto.trim();
  const mensagem = payload.mensagem.trim();

  if (!nome) {
    return { ok: false, error: "Informe seu nome." };
  }
  if (!assunto) {
    return { ok: false, error: "Informe um assunto." };
  }
  if (mensagem.length < 10) {
    return {
      ok: false,
      error: "Descreva com pelo menos 10 caracteres para entendermos melhor.",
    };
  }

  if (
    payload.avaliacao !== undefined &&
    (payload.avaliacao < 1 || payload.avaliacao > 5)
  ) {
    return { ok: false, error: "Avaliação deve ser entre 1 e 5." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("customer_feedback")
      .insert({
        tipo: payload.tipo,
        nome,
        equipe_id: payload.equipeId || null,
        contato: payload.contato?.trim() || null,
        assunto,
        mensagem,
        avaliacao: payload.avaliacao ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/atendimento");

    return { ok: true, id: data.id as string };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Não foi possível enviar.",
    };
  }
}

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
}

export async function updateFeedbackStatusAction(
  id: string,
  status: FeedbackStatus,
) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin
    .from("customer_feedback")
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/atendimento");
}

export async function updateFeedbackAdminNoteAction(
  id: string,
  notaAdmin: string,
) {
  await requireAuth();
  const admin = createAdminClient();
  const { error } = await admin
    .from("customer_feedback")
    .update({
      nota_admin: notaAdmin.trim() || null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/atendimento");
}
