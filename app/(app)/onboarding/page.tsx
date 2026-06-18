import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { AssistantForm } from "@/components/forms/assistant-form";
import { BusinessSettingsForm } from "@/components/forms/business-settings-form";
import { WhatsAppSettingsForm } from "@/components/forms/whatsapp-settings-form";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";

export default async function OnboardingPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  if (!business) redirect("/dashboard");

  return (
    <AppShell title="Onboarding em 3 passos" subtitle="Cadastre o negócio, prepare o WhatsApp e defina o atendente automático.">
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>1. Negócio</Badge>
        <Badge>2. WhatsApp</Badge>
        <Badge>3. Atendente</Badge>
      </div>
      <div className="space-y-6">
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
            tone: business.tone
          }}
        />
        <WhatsAppSettingsForm
          initialValues={{
            metaBusinessAccountId: business.whatsappConfig?.metaBusinessAccountId ?? "",
            metaPhoneNumberId: business.whatsappConfig?.metaPhoneNumberId ?? "",
            metaAppId: business.whatsappConfig?.metaAppId ?? "",
            verifyToken: business.whatsappConfig?.verifyToken ?? "",
            accessToken: business.whatsappConfig?.accessToken ?? "",
            isActive: business.whatsappConfig?.isActive ?? false
          }}
        />
        <AssistantForm business={business} products={business.products} faqs={business.faqs} />
      </div>
    </AppShell>
  );
}
