import { AppShell } from "@/components/dashboard/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIntegrationStatuses } from "@/server/services/integrations-service";

export default function IntegrationsPage() {
  const statuses = getIntegrationStatuses();

  return (
    <AppShell title="Integrações" subtitle="Acompanhe o status de cada dependência externa e o que falta para ir a produção.">
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
    </AppShell>
  );
}
