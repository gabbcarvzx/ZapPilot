import React from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

import { CheckoutForm } from "@/components/forms/checkout-form";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPlanBySlug, getPlanPresentation, type PublicPlanSlug } from "@/lib/plans";
import { currency } from "@/lib/utils";

function InvalidPlanState() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16 lg:px-6">
      <PremiumCard className="w-full space-y-6 border-rose-200">
        <div>
          <StatusBadge tone="danger">Plano invalido</StatusBadge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Nao foi possivel identificar o plano</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Escolha novamente o plano comercial para criar sua conta com o checkout correto.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/pricing">Voltar para pricing</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Ir para a home</Link>
          </Button>
        </div>
      </PremiumCard>
    </main>
  );
}

export default async function SignUpPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const planSlug = (params.plan ?? "").trim().toLowerCase() as PublicPlanSlug;
  const selectedPlan = getPlanBySlug(planSlug);

  if (!selectedPlan) {
    return <InvalidPlanState />;
  }

  const presentation = getPlanPresentation(selectedPlan);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(76,29,149,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f4f0ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="mb-6">
          <Button asChild variant="ghost" className="-ml-3 text-slate-600">
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4" />
              Voltar para os planos
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
          <section className="space-y-6">
            <StatusBadge tone="brand">Cadastro integrado ao plano</StatusBadge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Crie sua conta e siga direto para o checkout do plano {selectedPlan.name}.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Sem cadastro solto, sem painel intermediario. Seus dados criam a conta, o tenant e a assinatura pendente em
                um unico fluxo comercial.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <PremiumCard className="space-y-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Conta + tenant</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Estrutura multi-tenant criada no mesmo passo do cadastro.
                  </p>
                </div>
              </PremiumCard>
              <PremiumCard className="space-y-3">
                <CreditCard className="h-5 w-5 text-violet-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Checkout imediato</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A assinatura pendente e gerada e voce segue direto para o ASAAS.
                  </p>
                </div>
              </PremiumCard>
              <PremiumCard className="space-y-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Primeiro acesso guiado</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Depois do pagamento, o dashboard abre um onboarding premium por etapas.
                  </p>
                </div>
              </PremiumCard>
            </div>

            <PremiumCard className="overflow-hidden p-0">
              <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_58%,#6d28d9_100%)] px-6 py-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">Resumo do pedido</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">{selectedPlan.name}</h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100/85">{selectedPlan.description}</p>
                  </div>
                  <div className="rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/80">Assinatura mensal</p>
                    <p className="mt-2 text-4xl font-semibold">{currency(selectedPlan.priceCents / 100)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Capacidade</p>
                  <p className="mt-2 text-sm font-medium text-slate-950">{presentation.messageLimit}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{presentation.socialProof}</p>
                </div>
                <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Fluxo apos cadastro</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      Criar usuario e empresa
                    </li>
                    <li className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      Abrir checkout seguro via ASAAS
                    </li>
                    <li className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      Liberar dashboard com onboarding premium
                    </li>
                  </ul>
                </div>
              </div>
            </PremiumCard>
          </section>

          <section className="xl:sticky xl:top-6">
            <PremiumCard className="border-white/80 bg-white/96">
              <div className="mb-6">
                <StatusBadge tone="brand">{presentation.badge}</StatusBadge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Complete seu cadastro</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O proximo clique ja abre o pagamento recorrente do seu plano selecionado.
                </p>
              </div>
              <CheckoutForm plan={planSlug} mode="signup" />
            </PremiumCard>
          </section>
        </div>
      </div>
    </main>
  );
}
