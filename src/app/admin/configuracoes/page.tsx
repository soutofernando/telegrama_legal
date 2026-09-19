import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsManager } from "@/components/admin/settings-manager";
import { getAppSettings } from "@/lib/data/app-settings";

export default async function SettingsAdminPage() {
  const settings = await getAppSettings();

  return (
    <AdminShell
      title="Configurações"
      subtitle="PIX, WhatsApp e mensagem do checkout"
    >
      <SettingsManager settings={settings} />
    </AdminShell>
  );
}
