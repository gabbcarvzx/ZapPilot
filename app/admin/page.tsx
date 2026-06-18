import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireAdmin } from "@/lib/guards";
import { PLAN_CATALOG } from "@/lib/plans";
import { getAllBusinessesWithSubscriptions, updateSubscription as saveSubscription } from "@/server/services/subscription-service";

async function updateSubscriptionAction(formData: FormData) {
  "use server";

  await saveSubscription({
    businessId: formData.get("businessId"),
    planId: formData.get("planId"),
    status: formData.get("status")
  });
}

export default async function AdminPage() {
  await requireAdmin();
  const rows = await getAllBusinessesWithSubscriptions();

  return (
    <AppShell title="Admin" subtitle="Ative planos, acompanhe negócios conectados e controle o acesso comercial da operação.">
      <Card>
        <CardHeader>
          <CardTitle>Clientes cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Negócio</TH>
                <TH>Dono</TH>
                <TH>Plano</TH>
                <TH>Status</TH>
                <TH>WhatsApp</TH>
                <TH>Ação</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD>{row.name}</TD>
                  <TD>{row.owner?.email ?? "-"}</TD>
                  <TD>{row.subscriptions[0]?.plan?.name ?? "Start"}</TD>
                  <TD>{row.subscriptions[0]?.status ?? "PENDING"}</TD>
                  <TD>{row.whatsappConfig?.isActive ? "Conectado" : "Mock"}</TD>
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
    </AppShell>
  );
}
