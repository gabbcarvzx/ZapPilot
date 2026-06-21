import { AppShell } from "@/components/dashboard/app-shell";
import { DiagnosticSummary } from "@/components/dashboard/diagnostic-summary";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses } from "@/server/services/integrations-service";
import { getTenantOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);
  const statuses = getIntegrationStatuses();
  const diagnosticSummary = await getTenantOperationalDiagnostics({
    subscriptionStatus: subscription?.status,
    whatsappConfig: business?.whatsappConfig
  });
  const allIntegrationsPending = statuses.every((status) => !status.configured);

  return (
    <AppShell title="Status das integracoes" subtitle="Entenda o que ja esta pronto para operar e o que falta ajustar antes do atendimento real.">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Operacao"
          title="Leitura unica das integracoes"
          description="Tudo que impacta a entrada em operacao fica visivel aqui: plano, canal, webhook e capacidade de resposta."
        />

        <DiagnosticSummary summary={diagnosticSummary} />
        {allIntegrationsPending ? (
          <EmptyState
            title="Ambiente ainda em configuracao"
            description="Banco, IA e WhatsApp ainda estao em modo simulado. Isso e suficiente para demo, mas nao para operacao real."
            actionLabel="Use este painel como checklist de ativacao"
          />
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {statuses.map((status) => (
            <PremiumCard key={status.name}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">{status.name}</h2>
                  <StatusBadge tone={status.configured ? "success" : "warning"}>{status.mode}</StatusBadge>
                </div>
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-6 text-slate-600">{status.description}</p>
                <p className="rounded-2xl bg-violet-50 p-4 text-sm font-medium text-slate-700">{status.nextStep}</p>
              </div>
            </PremiumCard>
          ))}
          <PremiumCard>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">Billing</h2>
              <StatusBadge tone="neutral">{diagnosticSummary.billing.mode}</StatusBadge>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-6 text-slate-600">{diagnosticSummary.billing.detail}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
                O fluxo de cobranca ainda nao foi integrado nesta branch. O foco atual continua em operacao, onboarding e diagnostico.
              </p>
            </div>
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  );
}
