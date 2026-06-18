import { AppShell } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireAdmin } from "@/lib/guards";
import { PLAN_CATALOG } from "@/lib/plans";
import { getTenantDiagnosticSummary } from "@/server/services/integrations-service";
import { getActivationGuidance, getAllBusinessesWithSubscriptions, updateSubscription as saveSubscription } from "@/server/services/subscription-service";

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
  const rows = await getAllBusinessesWithSubscriptions();
  const rowSummaries = rows.map((row) => {
    const diagnosticSummary = getTenantDiagnosticSummary({
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
  });
  const activeCount = rowSummaries.filter((item) => item.row.subscriptions[0]?.status === "ACTIVE").length;
  const pendingCount = rowSummaries.filter((item) => (item.row.subscriptions[0]?.status ?? "PENDING") === "PENDING").length;
  const readyCount = rowSummaries.filter((item) => item.activationGuidance.tone === "success").length;

  return (
    <AppShell title="Admin" subtitle="Ative planos, acompanhe negocios conectados e controle o acesso comercial da operacao.">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Planos ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{activeCount}</p>
              <p className="text-sm text-slate-600">Tenants liberados comercialmente pelo admin.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{pendingCount}</p>
              <p className="text-sm text-slate-600">Negocios que ainda nao podem responder automaticamente.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prontos para teste live</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{readyCount}</p>
              <p className="text-sm text-slate-600">Tenants com ativacao suficiente para validacao operacional.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clientes cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Negocio</TH>
                  <TH>Dono</TH>
                  <TH>Plano</TH>
                  <TH>Status</TH>
                  <TH>WhatsApp</TH>
                  <TH>Operacao</TH>
                  <TH>Acao</TH>
                </TR>
              </THead>
              <TBody>
                {rowSummaries.map(({ row, activationGuidance }) => (
                  <TR key={row.id}>
                    <TD>{row.name}</TD>
                    <TD>{row.owner?.email ?? "-"}</TD>
                    <TD>{row.subscriptions[0]?.plan?.name ?? "Start"}</TD>
                    <TD>
                      <Badge className={getToneClassName(activationGuidance.tone)}>{row.subscriptions[0]?.status ?? "PENDING"}</Badge>
                    </TD>
                    <TD>{row.whatsappConfig?.isActive ? "Conectado" : "Mock"}</TD>
                    <TD>
                      <div className="max-w-xs space-y-1">
                        <p className="text-sm font-medium text-slate-900">{activationGuidance.title}</p>
                        <p className="text-xs text-slate-600">{activationGuidance.nextStep}</p>
                      </div>
                    </TD>
                    <TD>
                      <form action={updateSubscriptionAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="businessId" value={row.id} />
                        <select name="planId" defaultValue={row.subscriptions[0]?.planId ?? PLAN_CATALOG[0].id} className="rounded-xl border px-3 py-2 text-sm">
                          {PLAN_CATALOG.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <select name="status" defaultValue={row.subscriptions[0]?.status ?? "PENDING"} className="rounded-xl border px-3 py-2 text-sm">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="CANCELED">CANCELED</option>
                          <option value="EXPIRED">EXPIRED</option>
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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
