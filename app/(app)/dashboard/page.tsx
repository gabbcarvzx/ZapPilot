import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/dashboard/app-shell";
import { DiagnosticSummary } from "@/components/dashboard/diagnostic-summary";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses } from "@/server/services/integrations-service";
import { listMessagesForBusiness } from "@/server/services/message-service";
import { getTenantOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";
import { getActivationGuidance, getSubscriptionForBusiness } from "@/server/services/subscription-service";
import { BadgeDollarSign, CheckCircle2, ChevronRight, MessageSquareMore, ShieldCheck, Sparkles } from "lucide-react";

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

function getFirstRunSteps(input: {
  business:
    | {
        niche?: string | null;
        phone?: string | null;
        businessHours?: string | null;
        products?: Array<unknown>;
        faqs?: Array<unknown>;
        whatsappConfig?: {
          metaPhoneNumberId?: string | null;
          verifyToken?: string | null;
          isActive?: boolean | null;
        } | null;
      }
    | null;
  hasMessages: boolean;
}) {
  const business = input.business;
  const businessReady = Boolean(business?.niche && business?.phone && business?.businessHours);
  const productsReady = Boolean(business?.products?.length);
  const faqsReady = Boolean(business?.faqs?.length);
  const whatsappReady = Boolean(
    business?.whatsappConfig?.metaPhoneNumberId && business?.whatsappConfig?.verifyToken
  );
  const assistantReady = input.hasMessages;

  return [
    {
      key: "business",
      title: "Empresa",
      description: "Defina nicho, telefone e horario para contextualizar a operacao.",
      href: "/settings/business",
      complete: businessReady
    },
    {
      key: "products",
      title: "Produtos",
      description: "Cadastre seu item principal para a IA responder com mais contexto.",
      href: "/assistant",
      complete: productsReady
    },
    {
      key: "faq",
      title: "FAQ",
      description: "Preencha perguntas comerciais para reduzir friccao no atendimento.",
      href: "/assistant",
      complete: faqsReady
    },
    {
      key: "whatsapp",
      title: "WhatsApp",
      description: "Prepare o canal com credenciais e webhook antes da ativacao real.",
      href: "/settings/whatsapp",
      complete: whatsappReady
    },
    {
      key: "test",
      title: "Teste do assistente",
      description: "Gere a primeira conversa para validar copy, tom e fluxo.",
      href: "/messages",
      complete: assistantReady
    }
  ];
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
  const firstRunSteps = getFirstRunSteps({ business, hasMessages: messages.length > 0 });
  const completedSteps = firstRunSteps.filter((step) => step.complete).length;
  const progressPercent = Math.round((completedSteps / firstRunSteps.length) * 100);
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
        {!business?.isOnboardingComplete ? (
          <PremiumCard className="overflow-hidden p-0">
            <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_58%,#6d28d9_100%)] px-6 py-6 text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <StatusBadge tone={subscription?.status === "ACTIVE" ? "success" : "warning"} className="bg-white/12 text-white ring-white/15">
                    {subscription?.status === "ACTIVE" ? "Primeiro acesso liberado" : "Pagamento pendente"}
                  </StatusBadge>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">Onboarding premium do primeiro acesso</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/85">
                    Complete a operacao em cinco passos para sair do setup e entrar em um fluxo comercial mais confiavel.
                  </p>
                </div>
                <div className="rounded-[28px] bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/80">Progresso</p>
                  <p className="mt-2 text-3xl font-semibold">{completedSteps}/5</p>
                  <p className="mt-1 text-sm text-violet-100/80">{progressPercent}% concluido</p>
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2 2xl:grid-cols-5">
              {firstRunSteps.map((step, index) => (
                <div key={step.key} className="rounded-[28px] border border-violet-100 bg-white/90 p-4 shadow-sm shadow-violet-900/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Passo {index + 1}</div>
                    <StatusBadge tone={step.complete ? "success" : "warning"}>{step.complete ? "Concluido" : "Pendente"}</StatusBadge>
                  </div>
                  <p className="mt-4 text-base font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                  <Button asChild variant={step.complete ? "secondary" : "default"} className="mt-4 w-full justify-between">
                    <Link href={step.href}>
                      {step.complete ? "Revisar etapa" : "Abrir etapa"}
                      {step.complete ? <CheckCircle2 className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </PremiumCard>
        ) : null}

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
                className="inline-flex w-full justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 sm:w-auto"
              >
                Regularizar assinatura
              </a>
              <p className="text-sm text-slate-600">Os recursos pagos continuam bloqueados ate a confirmacao segura do pagamento.</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
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
                  className="mt-5 inline-flex w-full justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 sm:w-auto"
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
              <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
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
                    <p className="mt-3 break-words text-sm text-slate-600">{conversation.messages.at(-1)?.content ?? "Sem mensagens."}</p>
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
