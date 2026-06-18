import { AppShell } from "@/components/dashboard/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses } from "@/server/services/integrations-service";
import { listMessagesForBusiness } from "@/server/services/message-service";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const statuses = getIntegrationStatuses();
  const messages = await listMessagesForBusiness(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);

  return (
    <AppShell
      title={`Olá, ${user.name?.split(" ")[0] ?? "cliente"}`}
      subtitle="Acompanhe o status do plano, o nível de configuração do negócio e a prontidão das integrações."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status do plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge>{subscription?.status ?? "PENDING"}</Badge>
              <p className="text-sm text-slate-600">Plano atual: {subscription?.plan?.name ?? "Start"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge className={business?.isOnboardingComplete ? "bg-emerald-100 text-emerald-800" : ""}>
                {business?.isOnboardingComplete ? "Completo" : "Pendente"}
              </Badge>
              <p className="text-sm text-slate-600">Negócio: {business?.name ?? "Não configurado"}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
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
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Últimas conversas</CardTitle>
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
    </AppShell>
  );
}
