import { AppShell } from "@/components/dashboard/app-shell";
import { DiagnosticSummary } from "@/components/dashboard/diagnostic-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { getIntegrationStatuses, getTenantDiagnosticSummary } from "@/server/services/integrations-service";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  const subscription = await getSubscriptionForBusiness(user.businessId);
  const statuses = getIntegrationStatuses();
  const diagnosticSummary = getTenantDiagnosticSummary({
    subscriptionStatus: subscription?.status,
    whatsappConfig: business?.whatsappConfig
  });

  return (
    <AppShell title="Integracoes" subtitle="Acompanhe o status de cada dependencia externa e o que falta para ir a producao.">
      <div className="space-y-6">
        <DiagnosticSummary summary={diagnosticSummary} />

        <div className="grid gap-6 md:grid-cols-2">
          {statuses.map((status) => (
            <Card key={status.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{status.name}</CardTitle>
                  <Badge className={status.configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {status.mode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">{status.description}</p>
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{status.nextStep}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
