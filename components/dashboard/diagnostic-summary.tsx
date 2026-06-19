import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenantDiagnosticSummary } from "@/server/services/integrations-service";

interface DiagnosticSummaryProps {
  summary: TenantDiagnosticSummary;
}

function getBadgeClassName(status: "healthy" | "degraded" | "blocked" | "ready") {
  if (status === "healthy" || status === "ready") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "degraded") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-100 text-rose-800";
}

export function DiagnosticSummary({ summary }: DiagnosticSummaryProps) {
  const items = [
    { name: "Plano", value: summary.plan },
    { name: "WhatsApp", value: summary.whatsapp },
    { name: "IA ativa", value: summary.ai },
    { name: "Banco de dados", value: summary.database },
    { name: "Conexao WhatsApp", value: summary.webhook }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <CardTitle>Prontidao operacional</CardTitle>
          <p className="text-sm text-slate-600">{summary.readiness.reason}</p>
        </div>
        <Badge className={getBadgeClassName(summary.readiness.status)}>
          {summary.readiness.status === "ready" ? "Pronto para atender" : "Bloqueado"}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.name} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <Badge className={getBadgeClassName(item.value.status)}>{item.value.label}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.value.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
