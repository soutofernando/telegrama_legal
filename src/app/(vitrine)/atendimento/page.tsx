import type { Metadata } from "next";
import { MessageSquareHeart } from "lucide-react";
import { FeedbackForm } from "@/components/vitrine/feedback-form";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";
import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/types/database";

export const metadata: Metadata = {
  title: "Atendimento",
  description: "Central de reclamações, feedbacks e sugestões",
};

export default async function AtendimentoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("teams").select("*").order("nome");

  return (
    <div className={`mx-auto max-w-lg ${VITRINE_GUTTER} py-6 sm:py-8`}>
      <div className="mb-6 flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"
          aria-hidden
        >
          <MessageSquareHeart className="h-6 w-6" strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            Central de atendimento
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Reclamações, elogios e ideias para melhorar o encontro. Tudo é lido
            pela organização do {`Telegrama Legal`}.
          </p>
        </div>
      </div>

      <FeedbackForm teams={(data ?? []) as Team[]} />
    </div>
  );
}
