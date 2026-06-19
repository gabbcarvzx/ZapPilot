import { AppShell } from "@/components/dashboard/app-shell";
import { WhatsAppSettingsForm } from "@/components/forms/whatsapp-settings-form";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";

export default async function WhatsAppSettingsPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const config = business?.whatsappConfig;

  return (
    <AppShell title="Conexao WhatsApp" subtitle="Salve as credenciais da Meta quando quiser sair do modo simulado e validar o canal real.">
      <WhatsAppSettingsForm
        initialValues={{
          metaBusinessAccountId: config?.metaBusinessAccountId ?? "",
          metaPhoneNumberId: config?.metaPhoneNumberId ?? "",
          metaAppId: config?.metaAppId ?? "",
          verifyToken: config?.verifyToken ?? "",
          accessToken: config?.accessToken ?? "",
          isActive: config?.isActive ?? false
        }}
      />
    </AppShell>
  );
}
