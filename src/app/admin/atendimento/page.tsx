import { AdminShell } from "@/components/admin/admin-shell";
import { FeedbackManager } from "@/components/admin/feedback-manager";
import { createClient } from "@/lib/supabase/server";
import type { CustomerFeedbackWithTeam } from "@/types/database";

export default async function AdminAtendimentoPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customer_feedback")
    .select("*, teams(nome)")
    .order("criado_em", { ascending: false });

  return (
    <AdminShell
      title="Atendimento"
      subtitle="Reclamações, feedbacks e sugestões dos clientes"
    >
      <FeedbackManager items={(data ?? []) as CustomerFeedbackWithTeam[]} />
    </AdminShell>
  );
}
