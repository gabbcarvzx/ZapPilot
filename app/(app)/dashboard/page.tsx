import React from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { DiagnosticSummary } from "@/components/dashboard/diagnostic-summary";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses } from "@/server/services/integrations-service";
import { listMessagesForBusiness } from "@/server/services/message-service";
import { getTenantOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";
import { getActivationGuidance, getSubscriptionForBusiness } from "@/server/services/subscription-service";
import { BadgeDollarSign, MessageSquareMore, ShieldCheck, Sparkles } from "lucide-react";

function translatePlanStatus(status?: string | null) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "CANCELED") return "Cancelado";
  if (status === "EXPIRED") return "Expirado";
  return "Pendente";
}

function translatePaymentStatus(status?: string | null) {
  if (!status) return "Sem cobranca";
  if (status === "RECEIVED") return "Recebido";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "OVERDUE") return "Vencido";
  if (status === "REFUNDED") return "Reembolsado";
  if (status === "CANCELED") return "Cancelado";
  if (status === "CHECKOUT_PENDING") return "Checkout pendente";
  return "Pendente";
}

function getDaysRemaining(date?: string | null) {
  if (!date) return null;

  const diffMs = new Date(date).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Number.isFinite(diffDays) ? diffDays : null;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const statuses = getIntegrationStatuses();
  const messages = await listMessagesForBusiness(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);
  const diagnosticSummary = await getTenantOperationalDiagnostics({
    subscriptionStatus: subscription?.status,
    whatsappConfig: business?.whatsappConfig
  });
  const activationGuidance = getActivationGuidance({
    subscriptionStatus: subscription?.status,
    whatsappActive: business?.whatsappConfig?.isActive ?? false,
    readinessStatus: diagnosticSummary.readiness.status
  });
  const checkoutUrl = subscription && "checkoutUrl" in subscription ? subscription.checkoutUrl : null;
  const daysRemaining = getDaysRemaining(subscription?.currentPeriodEnd);
  const hasPendingBilling = subscription?.status !== "ACTIVE";
  const activationCardClassName =
    activationGuidance.tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : activationGuidance.tone === "danger"
        ? "border-rose-200 bg-rose-50"
        : "border-amber-200 bg-amber-50";

  return (
    <AppShell
      title={`Ola, ${user.name?.split(" ")[0] ?? "cliente"}`}
      subtitle="Acompanhe o plano, a configuracao da empresa e o que ainda falta para colocar o atendimento em operacao."
    >
      <div className="space-y-6">
        <DiagnosticSummary summary={diagnosticSummary} />

        <div className={`rounded-[28px] border p-6 shadow-sm ${activationCardClassName}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status comercial</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{activationGuidance.title}</h2>
            </div>
            <StatusBadge tone={activationGuidance.tone === "success" ? "success" : activationGuidance.tone === "danger" ? "danger" : "warning"}>
              {translatePlanStatus(subscription?.status)}
            </StatusBadge>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>{activationGuidance.detail}</p>
            <p className="font-medium text-slate-900">{activationGuidance.nextStep}</p>
          </div>
          {hasPendingBilling && checkoutUrl ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5"
              >
                Regularizar assinatura
              </a>
              <p className="text-sm text-slate-600">Os recursos pagos continuam bloqueados ate a confirmacao segura do pagamento.</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Plano"
            value={translatePlanStatus(subscription?.status)}
            description={`Plano atual: ${subscription?.plan?.name ?? "Start"}`}
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
          <MetricCard
            label="Assinatura"
            value={translatePaymentStatus(subscription?.paymentStatus)}
            description={
              subscription?.currentPeriodEnd
                ? `Proxima cobranca em ${new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}`
                : "Aguardando definicao do ciclo de cobranca."
            }
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
          <MetricCard
            label="Modo operacional"
            value={diagnosticSummary.whatsapp.mode}
            description={`Auth ${diagnosticSummary.auth.label} e billing ${diagnosticSummary.billing.label.toLowerCase()}.`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Configuracao"
            value={business?.isOnboardingComplete ? "Completa" : "Pendente"}
            description={`Negocio: ${business?.name ?? "Nao configurado"}`}
            icon={<Sparkles className="h-5 w-5" />}
          />
          <MetricCard
            label="Conversas"
            value={messages.length}
            description="Historico salvo para demonstracao, testes e acompanhamento operacional."
            icon={<MessageSquareMore className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="space-y-6">
            <PremiumCard>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">Status do plano</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Enquanto o plano estiver pendente, cancelado ou expirado, o sistema nao responde automaticamente no WhatsApp.
                  </p>
                </div>
                <StatusBadge tone={subscription?.status === "ACTIVE" ? "success" : subscription?.status === "PENDING" ? "warning" : "danger"}>
                  {translatePlanStatus(subscription?.status)}
                </StatusBadge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pagamento</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{translatePaymentStatus(subscription?.paymentStatus)}</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Proxima cobranca</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">
                    {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR") : "Aguardando ciclo"}
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Dias restantes</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{daysRemaining ?? "-"}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-slate-700">
                {subscription?.status === "ACTIVE"
                  ? "Seu plano esta liberado para recursos pagos e operacao real no WhatsApp."
                  : "Enquanto a assinatura estiver pendente, cancelada ou expirada, o envio real e a automacao comercial permanecem bloqueados."}
              </div>
              {checkoutUrl && subscription?.status !== "ACTIVE" ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5"
                >
                  Verificar pagamento
                </a>
              ) : null}
            </PremiumCard>

            <PremiumCard>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">Integracoes</h3>
                  <p className="mt-1 text-sm text-slate-600">Acompanhe o que ja esta pronto para operar e o que ainda precisa de ajuste.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {statuses.map((status) => (
                  <div key={status.name} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{status.name}</p>
                      <StatusBadge tone={status.configured ? "success" : "warning"}>
                        {status.mode}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{status.description}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{status.nextStep}</p>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>

          <PremiumCard>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">Ultimas conversas</h3>
            <p className="mt-2 text-sm text-slate-600">Use esse historico para demonstracoes, testes guiados e validacao do atendimento.</p>
            <div className="mt-6 space-y-4">
              {messages.length === 0 ? (
                <EmptyState
                  title="Nenhuma conversa registrada"
                  description="Use o simulador para gerar a primeira conversa operacional e validar como o atendimento vai aparecer para a equipe."
                  actionLabel="Comece pela primeira simulacao"
                />
              ) : (
                messages.slice(0, 3).map((conversation: (typeof messages)[number]) => (
                  <div key={conversation.id} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{conversation.contactName || conversation.contactPhone}</p>
                      <StatusBadge tone="brand">{conversation.status}</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{conversation.messages.at(-1)?.content ?? "Sem mensagens."}</p>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  );
}
