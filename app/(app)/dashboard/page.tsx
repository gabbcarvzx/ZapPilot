import { AppShell } from "@/components/dashboard/app-shell";
import { DiagnosticSummary } from "@/components/dashboard/diagnostic-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses, getTenantDiagnosticSummary } from "@/server/services/integrations-service";
import { listMessagesForBusiness } from "@/server/services/message-service";
import { getActivationGuidance, getSubscriptionForBusiness } from "@/server/services/subscription-service";

function translatePlanStatus(status?: string | null) {
  if (status === "ACTIVE") return "Ativo";
  if (status === "CANCELED") return "Cancelado";
  if (status === "EXPIRED") return "Expirado";
  return "Pendente";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const statuses = getIntegrationStatuses();
  const messages = await listMessagesForBusiness(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);
  const diagnosticSummary = getTenantDiagnosticSummary({
    subscriptionStatus: subscription?.status,
    whatsappConfig: business?.whatsappConfig
  });
  const activationGuidance = getActivationGuidance({
    subscriptionStatus: subscription?.status,
    whatsappActive: business?.whatsappConfig?.isActive ?? false,
    readinessStatus: diagnosticSummary.readiness.status
  });
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

        <Card className={activationCardClassName}>
          <CardHeader>
            <CardTitle>{activationGuidance.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>{activationGuidance.detail}</p>
            <p className="font-medium text-slate-900">{activationGuidance.nextStep}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status do plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge>{translatePlanStatus(subscription?.status)}</Badge>
                <p className="text-sm text-slate-600">Plano atual: {subscription?.plan?.name ?? "Start"}</p>
                {subscription?.status !== "ACTIVE" ? (
                  <p className="text-sm text-slate-600">
                    Enquanto o plano estiver pendente, cancelado ou expirado, o sistema nao responde automaticamente no WhatsApp.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuracao inicial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge className={business?.isOnboardingComplete ? "bg-emerald-100 text-emerald-800" : ""}>
                  {business?.isOnboardingComplete ? "Completo" : "Pendente"}
                </Badge>
                <p className="text-sm text-slate-600">Negocio: {business?.name ?? "Nao configurado"}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Integracoes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {statuses.map((status) => (
                  <div key={status.name} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{status.name}</p>
                      <Badge className={status.configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {status.mode}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{status.description}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{status.nextStep}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ultimas conversas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.slice(0, 3).map((conversation: (typeof messages)[number]) => (
                <div key={conversation.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{conversation.contactName || conversation.contactPhone}</p>
                    <Badge>{conversation.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{conversation.messages.at(-1)?.content ?? "Sem mensagens."}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
