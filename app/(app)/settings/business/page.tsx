import { AppShell } from "@/components/dashboard/app-shell";
import { BusinessSettingsForm } from "@/components/forms/business-settings-form";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";

export default async function BusinessSettingsPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  if (!business) return null;

  return (
    <AppShell title="Negócio" subtitle="Ajuste dados comerciais, contexto e mensagens que alimentam a automação.">
      <BusinessSettingsForm
        initialValues={{
          name: business.name,
          niche: business.niche,
          address: business.address,
          phone: business.phone,
          whatsappNumber: business.whatsappNumber,
          businessHours: "businessHoursJson" in business ? business.businessHoursJson : business.businessHours,
          welcomeMessage: business.welcomeMessage,
          closedMessage: business.closedMessage,
          tone: business.tone,
          isOnboardingComplete: business.isOnboardingComplete
        }}
      />
    </AppShell>
  );
}
