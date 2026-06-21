import React from "react";
import Link from "next/link";
import { Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";

type SuccessStatus = "pending" | "active" | "unknown";

function resolveStatus(status: string | undefined): SuccessStatus {
  if (status === "active") return "active";
  if (status === "pending") return "pending";
  return "unknown";
}

export default async function SuccessPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const status = resolveStatus(params.status);

  const content =
    status === "active"
      ? {
          eyebrow: "Assinatura confirmada",
          title: "Assinatura ativa",
          description:
            "Seu acesso comercial ja esta liberado. Agora o proximo passo e concluir o onboarding premium para colocar a operacao em atendimento real com mais rapidez e clareza.",
          icon: Sparkles,
          tone: "success" as const,
          primaryCta: { href: "/dashboard", label: "Ir para o dashboard" },
          secondaryCta: { href: "/pricing", label: "Ver planos" },
          checklist: ["Empresa", "Produtos", "FAQ", "WhatsApp", "Teste do assistente"]
        }
      : status === "pending"
        ? {
            eyebrow: "Pagamento em analise",
            title: "Seu pagamento foi iniciado",
            description:
              "A confirmacao pode levar alguns instantes. Assim que ela entrar, seu dashboard abre o onboarding premium completo para colocar a operacao em movimento.",
            icon: Clock3,
            tone: "warning" as const,
            primaryCta: { href: "/dashboard", label: "Ir para o dashboard" },
            secondaryCta: { href: "/pricing", label: "Ver planos" },
            checklist: [
              "Empresa",
              "Produtos",
              "FAQ",
              "WhatsApp",
              "A automacao real sera liberada apos a confirmacao"
            ]
          }
        : {
            eyebrow: "Status em verificacao",
            title: "Nao conseguimos confirmar o status do pagamento agora",
            description:
              "Sua conta pode ja estar criada, mas ainda nao recebemos uma confirmacao segura desta etapa. Voce pode tentar novamente pelos planos ou seguir para o painel.",
            icon: ShieldCheck,
            tone: "neutral" as const,
            primaryCta: { href: "/pricing", label: "Voltar aos planos" },
            secondaryCta: { href: "/dashboard", label: "Ir para o dashboard" },
            checklist: [
              "Revisar o plano escolhido",
              "Retomar o pagamento se necessario",
              "Acessar o painel para continuar a configuracao"
            ]
          };

  const Icon = content.icon;

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 lg:px-6">
      <PremiumCard className="overflow-hidden p-0">
        <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_52%,#6d28d9_100%)] px-8 py-8 text-white">
          <StatusBadge
            tone={content.tone}
            className={
              content.tone === "success"
                ? "bg-emerald-400/15 text-emerald-100 ring-emerald-300/20"
                : "bg-white/15 text-violet-50 ring-white/20"
            }
          >
            {content.eyebrow}
          </StatusBadge>
          <div className="mt-4 flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{content.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-violet-100/85">{content.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:p-8 md:grid-cols-2 xl:grid-cols-5">
          {content.checklist.map((item) => (
            <div key={item} className="rounded-[28px] border border-violet-100 bg-violet-50/70 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm leading-6 text-slate-700">{item}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href={content.primaryCta.href}>{content.primaryCta.label}</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={content.secondaryCta.href}>{content.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </PremiumCard>
    </main>
  );
}
