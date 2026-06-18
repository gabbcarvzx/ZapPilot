import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
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
    <AppShell title="Onboarding em 3 passos" subtitle="Cadastre o negocio, prepare o WhatsApp e defina o atendente automatico.">
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>1. Negocio</Badge>
        <Badge>2. WhatsApp</Badge>
        <Badge>3. Atendente</Badge>
      </div>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <EmptyState
            title="Passo 1: contexto comercial"
            description="Abra a call preenchendo nome, nicho, horario e mensagens base. Isso ajuda o lead a se reconhecer no produto."
            actionLabel="Mostre como o negocio fala hoje"
          />
          <EmptyState
            title="Passo 2: prontidao de WhatsApp"
            description="Explique o que ja pode ser salvo agora e o que so depende da Meta quando o numero comercial estiver pronto."
            actionLabel="Use mock com honestidade operacional"
          />
          <EmptyState
            title="Passo 3: pitch do atendente"
            description="Cadastre um produto principal e uma FAQ forte para que a simulacao mostre valor comercial em poucos segundos."
            actionLabel="Leve a demo ate a primeira resposta"
          />
        </div>
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
