import { getAppSettings } from "@/lib/data/app-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutStepper } from "@/components/vitrine/checkout-stepper";
import type { DeliverySlot, Team } from "@/types/database";

export const revalidate = 300;

async function getCheckoutData() {
  const supabase = createAdminClient();
  const [teamsRes, slotsRes, whatsappSettings] = await Promise.all([
    supabase.from("teams").select("*").order("nome"),
    supabase.from("delivery_slots").select("*").order("sort_order"),
    getAppSettings(),
  ]);
  return {
    teams: (teamsRes.data ?? []) as Team[],
    slots: (slotsRes.data ?? []) as DeliverySlot[],
    whatsappSettings,
  };
}

export default async function CheckoutPage() {
  const { teams, slots, whatsappSettings } = await getCheckoutData();

  return (
    <div className="mx-auto max-w-lg px-5 py-6 sm:py-8">
      <CheckoutStepper active={2} />
      <h1 className="font-display mt-6 text-2xl font-extrabold text-foreground">
        Finalizar pedido
      </h1>
      <p className="mt-2 text-sm text-muted">
        Preencha seus dados para concluir o pedido.
      </p>
      <div className="mt-6">
        <CheckoutForm teams={teams} slots={slots} whatsapp={whatsappSettings} />
      </div>
    </div>
  );
}
