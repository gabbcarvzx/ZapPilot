import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TenantOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";

interface DiagnosticSummaryProps {
  summary: TenantOperationalDiagnostics;
}

function getBadgeClassName(status: "healthy" | "degraded" | "blocked" | "ready" | "not_configured") {
  if (status === "healthy" || status === "ready") {
    return "success";
  }

  if (status === "degraded" || status === "not_configured") {
    return "warning";
  }

  return "danger";
}

export function DiagnosticSummary({ summary }: DiagnosticSummaryProps) {
  const items = [
    { name: "WhatsApp", value: summary.whatsapp },
    { name: "Gemini", value: summary.ai },
    { name: "Auth", value: summary.auth },
    { name: "Banco de dados", value: summary.database },
    { name: "Webhook", value: summary.webhook },
    { name: "Billing", value: summary.billing }
  ];

  return (
    <PremiumCard>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">Prontidao operacional</h2>
          <p className="text-sm text-slate-600">{summary.readiness.reason}</p>
        </div>
        <StatusBadge tone={getBadgeClassName(summary.readiness.status)}>
          {summary.readiness.status === "ready" ? "Pronto para atender" : "Bloqueado"}
        </StatusBadge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge tone={getBadgeClassName(summary.plan.status)}>
          Plano: {summary.plan.label}
        </StatusBadge>
        <StatusBadge tone="neutral">
          Modo IA: {summary.ai.mode}
        </StatusBadge>
        <StatusBadge tone="neutral">
          Modo WhatsApp: {summary.whatsapp.mode}
        </StatusBadge>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {items.map((item) => (
          <div key={item.name} className="rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-900/5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <StatusBadge tone={getBadgeClassName(item.value.status)}>{item.value.label}</StatusBadge>
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
  );
}
