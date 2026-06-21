import React from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AssistantForm } from "@/components/forms/assistant-form";
import { BusinessSettingsForm } from "@/components/forms/business-settings-form";
import { WhatsAppSettingsForm } from "@/components/forms/whatsapp-settings-form";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StepIndicator } from "@/components/ui/step-indicator";
import { requireUser } from "@/lib/guards";
import { getPaidFeaturePolicy } from "@/server/policies/paid-feature-policy";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";

export default async function OnboardingPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);
  if (!business) redirect("/dashboard");
  const paidFeaturePolicy = getPaidFeaturePolicy(subscription?.status);
  const canActivateReal = paidFeaturePolicy.canActivateRealConnection;

  return (
    <AppShell title="Configuracao em 3 passos" subtitle="Cadastre a empresa, prepare o WhatsApp e defina o atendente automatico.">
      <div className="space-y-6">
        <PremiumCard className="premium-grid">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <StatusBadge tone="brand">Onboarding comercial</StatusBadge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{paidFeaturePolicy.userMessageDetail}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Enquanto isso, voce pode preparar empresa, canal e discurso comercial para acelerar a ativacao real.
              </p>
            </div>
            <StatusBadge tone={canActivateReal ? "success" : "warning"}>
              {canActivateReal ? "Pagamento confirmado para ativacao real" : "Conta criada, automacao bloqueada ate confirmacao"}
            </StatusBadge>
          </div>
          <div className="mt-6">
            <StepIndicator steps={["Empresa", "WhatsApp", "Atendente"]} />
          </div>
        </PremiumCard>

        <div className="grid gap-4 md:grid-cols-3">
          <EmptyState
            title="Passo 1: contexto comercial"
            description="Abra a call preenchendo nome, nicho, horario e mensagens base. Isso ajuda o lead a se reconhecer no produto."
            actionLabel="Mostre como a empresa fala hoje"
          />
          <EmptyState
            title="Passo 2: prontidao de WhatsApp"
            description="Explique o que ja pode ser salvo agora e o que so depende da Meta quando o numero comercial estiver pronto."
            actionLabel="Use o modo simulado com honestidade operacional"
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
          canActivateReal={canActivateReal}
          activationBlockedReason={paidFeaturePolicy.userMessageDetail}
        />
        <AssistantForm business={business} products={business.products} faqs={business.faqs} />
      </div>
    </AppShell>
  );
}
