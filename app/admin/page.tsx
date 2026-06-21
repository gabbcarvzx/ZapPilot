import React from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireAdmin } from "@/lib/guards";
import { PLAN_CATALOG } from "@/lib/plans";
import { getAdminOperationalSummary, getTenantOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";
import { getActivationGuidance, getAllBusinessesWithSubscriptions, updateSubscription as saveSubscription } from "@/server/services/subscription-service";
import { BadgeDollarSign, ShieldCheck, Sparkles } from "lucide-react";

function translatePlanStatus(status?: string | null) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "CANCELED") return "Cancelado";
  if (status === "EXPIRED") return "Expirado";
  return "Pendente";
}

function translatePaymentStatus(status?: string | null) {
  if (!status) return "Sem pagamento";
  if (status === "RECEIVED") return "Recebido";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "OVERDUE") return "Vencido";
  if (status === "REFUNDED") return "Reembolsado";
  if (status === "CANCELED") return "Cancelado";
  if (status === "CHECKOUT_PENDING") return "Checkout pendente";
  return "Pendente";
}

async function updateSubscriptionAction(formData: FormData) {
  "use server";

  await saveSubscription({
    businessId: formData.get("businessId"),
    planId: formData.get("planId"),
    status: formData.get("status")
  });
}

function getToneClassName(tone: "success" | "warning" | "danger") {
  if (tone === "success") return "bg-emerald-100 text-emerald-800";
  if (tone === "danger") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export default async function AdminPage() {
  await requireAdmin();
  const [rows, adminSummary] = await Promise.all([
    getAllBusinessesWithSubscriptions(),
    getAdminOperationalSummary()
  ]);
  const rowSummaries = await Promise.all(rows.map(async (row) => {
    const diagnosticSummary = await getTenantOperationalDiagnostics({
      subscriptionStatus: row.subscriptions[0]?.status,
      whatsappConfig: row.whatsappConfig
    });
    const activationGuidance = getActivationGuidance({
      subscriptionStatus: row.subscriptions[0]?.status,
      whatsappActive: row.whatsappConfig?.isActive ?? false,
      readinessStatus: diagnosticSummary.readiness.status
    });

    return {
      row,
      activationGuidance
    };
  }));
  const systemStatusTone =
    adminSummary.system.database.status === "blocked" || adminSummary.system.auth.status === "blocked" ? "danger" : "success";

  return (
    <AppShell title="Operacao" subtitle="Ative planos, acompanhe empresas conectadas e controle a liberacao comercial da operacao.">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Admin"
          title="Controle comercial da operacao"
          description="Monitore planos, liberacao comercial e prontidao de automacao sem perder contexto da empresa."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <MetricCard
            label="Clientes ativos"
            value={adminSummary.commercial.active}
            description="Empresas liberadas comercialmente pela operacao."
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
          <MetricCard
            label="Clientes trial"
            value={adminSummary.commercial.trial}
            description="Contas criadas e ainda sem confirmacao de checkout."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Clientes pendentes"
            value={adminSummary.commercial.pending}
            description="Assinaturas aguardando regularizacao comercial."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Clientes vencidos"
            value={adminSummary.commercial.expired}
            description="Assinaturas expiradas exigindo regularizacao."
            icon={<Sparkles className="h-5 w-5" />}
          />
          <MetricCard
            label="Receita estimada"
            value={`R$ ${(adminSummary.commercial.estimatedRevenueCents / 100).toFixed(2).replace(".", ",")}`}
            description="MRR estimado a partir dos clientes ativos. Nao representa extrato financeiro."
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
        </div>

        <PremiumCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Status geral do sistema</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Base tecnica para operar clientes pagantes com diagnostico, webhook, checkout e observabilidade minima.</p>
            </div>
            <StatusBadge tone={systemStatusTone}>Sistema {systemStatusTone === "success" ? "estavel" : "degradado"}</StatusBadge>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {[
              { name: "Banco", value: adminSummary.system.database },
              { name: "WhatsApp", value: adminSummary.system.whatsapp },
              { name: "Gemini", value: adminSummary.system.gemini },
              { name: "Auth", value: adminSummary.system.auth },
              { name: "Billing", value: adminSummary.system.billing },
              {
                name: "App",
                value: {
                  label: "Ativa",
                  detail: adminSummary.system.app.detail,
                  provider: "Next.js",
                  latencyMs: null,
                  mode: "Live",
                  status: adminSummary.system.app.status
                }
              }
            ].map((item) => (
              <div key={item.name} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <StatusBadge tone={item.value.status === "healthy" ? "success" : item.value.status === "blocked" ? "danger" : "warning"}>
                    {item.value.label}
                  </StatusBadge>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.value.mode}</p>
                {item.value.provider ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.value.provider}</p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.value.detail}</p>
                {typeof item.value.latencyMs === "number" ? (
                  <p className="mt-3 text-xs font-medium text-slate-500">Latencia: {item.value.latencyMs} ms</p>
                ) : null}
              </div>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Distribuicao comercial</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Leitura rapida de concentracao por plano e pressao de receita estimada.</p>
            </div>
            <StatusBadge tone="brand">Receita estimada</StatusBadge>
          </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {adminSummary.commercial.planDistribution.map((item) => (
              <div key={item.planName} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Plano</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{item.planName}</p>
                <p className="mt-2 text-sm text-slate-600">{item.count} cliente(s) nesta faixa comercial.</p>
              </div>
            ))}
          </div>
        </PremiumCard>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Tenants"
            value={adminSummary.tenants.total}
            description="Empresas cadastradas na operacao."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Config. incompleta"
            value={adminSummary.tenants.incompleteConfig}
            description="Tenants com onboarding ainda nao concluido."
            icon={<Sparkles className="h-5 w-5" />}
          />
          <MetricCard
            label="Modo mock"
            value={adminSummary.tenants.usingMock}
            description="Tenants ainda dependentes de algum modo simulado."
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            label="Sem WhatsApp"
            value={adminSummary.tenants.withoutWhatsApp}
            description="Tenants sem canal WhatsApp pronto para operar."
            icon={<BadgeDollarSign className="h-5 w-5" />}
          />
        </div>

        <PremiumCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Empresas cadastradas</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Pagamento, automacao e liberacao comercial visiveis na mesma grade operacional.</p>
            </div>
            <StatusBadge tone="brand">Ativacao manual preservada</StatusBadge>
          </div>
          {rowSummaries.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nenhuma empresa cadastrada"
                description="Quando novas contas entrarem no SaaS, a operacao vai acompanhar plano, WhatsApp e prontidao de ativacao por aqui."
                actionLabel="Aguardando primeiros tenants"
              />
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4 lg:hidden">
                {rowSummaries.map(({ row, activationGuidance }) => (
                  <div key={row.id} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-950">{row.name}</p>
                          <p className="text-sm text-slate-500">{row.owner?.email ?? "-"}</p>
                        </div>
                        <StatusBadge
                          tone={activationGuidance.tone === "success" ? "success" : activationGuidance.tone === "danger" ? "danger" : "warning"}
                          className={getToneClassName(activationGuidance.tone)}
                        >
                          {translatePlanStatus(row.subscriptions[0]?.status)}
                        </StatusBadge>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600">
                        <p>Plano: <span className="font-medium text-slate-900">{row.subscriptions[0]?.plan?.name ?? "Start"}</span></p>
                        <p>Pagamento: <span className="font-medium text-slate-900">{translatePaymentStatus(row.subscriptions[0]?.paymentStatus)}</span></p>
                        <p>WhatsApp: <span className="font-medium text-slate-900">{row.whatsappConfig?.isActive ? "Ativo" : "Simulado"}</span></p>
                        <p>Onboarding: <span className="font-medium text-slate-900">{row.isOnboardingComplete ? "Completo" : "Pendente"}</span></p>
                        <p className="text-slate-900">{activationGuidance.title}</p>
                        <p>{activationGuidance.nextStep}</p>
                      </div>
                      <form action={updateSubscriptionAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input type="hidden" name="businessId" value={row.id} />
                        <select
                          name="planId"
                          defaultValue={row.subscriptions[0]?.planId ?? PLAN_CATALOG[0].id}
                          className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm"
                        >
                          {PLAN_CATALOG.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <select
                          name="status"
                          defaultValue={row.subscriptions[0]?.status ?? "PENDING"}
                          className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="ACTIVE">Ativo</option>
                          <option value="PENDING">Pendente</option>
                          <option value="CANCELED">Cancelado</option>
                          <option value="EXPIRED">Expirado</option>
                        </select>
                        <Button size="sm" type="submit" className="w-full sm:w-auto">
                          Salvar
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 hidden overflow-x-auto lg:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Negocio</TH>
                      <TH>Dono</TH>
                      <TH>Plano</TH>
                      <TH>Status</TH>
                      <TH>Pagamento</TH>
                      <TH>WhatsApp</TH>
                      <TH>Operacao</TH>
                      <TH>Acao</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {rowSummaries.map(({ row, activationGuidance }) => (
                      <TR key={row.id}>
                        <TD className="font-medium text-slate-950">{row.name}</TD>
                        <TD>{row.owner?.email ?? "-"}</TD>
                        <TD>{row.subscriptions[0]?.plan?.name ?? "Start"}</TD>
                        <TD>
                          <StatusBadge
                            tone={
                              activationGuidance.tone === "success" ? "success" : activationGuidance.tone === "danger" ? "danger" : "warning"
                            }
                            className={getToneClassName(activationGuidance.tone)}
                          >
                            {translatePlanStatus(row.subscriptions[0]?.status)}
                          </StatusBadge>
                        </TD>
                        <TD>{translatePaymentStatus(row.subscriptions[0]?.paymentStatus)}</TD>
                        <TD>{row.whatsappConfig?.isActive ? "Ativo" : "Simulado"}</TD>
                        <TD>
                          <div className="max-w-xs space-y-1">
                            <p className="text-sm font-medium text-slate-900">{activationGuidance.title}</p>
                            <p className="text-xs text-slate-600">{activationGuidance.nextStep}</p>
                            <p className="text-xs text-slate-500">{row.isOnboardingComplete ? "Onboarding completo" : "Configuracao incompleta"}</p>
                          </div>
                        </TD>
                        <TD>
                          <form action={updateSubscriptionAction} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="businessId" value={row.id} />
                            <select
                              name="planId"
                              defaultValue={row.subscriptions[0]?.planId ?? PLAN_CATALOG[0].id}
                            className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm"
                            >
                              {PLAN_CATALOG.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                            <select
                              name="status"
                              defaultValue={row.subscriptions[0]?.status ?? "PENDING"}
                            className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="ACTIVE">Ativo</option>
                              <option value="PENDING">Pendente</option>
                              <option value="CANCELED">Cancelado</option>
                              <option value="EXPIRED">Expirado</option>
                            </select>
                            <Button size="sm" type="submit">
                              Salvar
                            </Button>
                          </form>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </>
          )}
        </PremiumCard>
      </div>
    </AppShell>
  );
}
