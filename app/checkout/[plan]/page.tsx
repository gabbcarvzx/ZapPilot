import React from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { CheckoutForm } from "@/components/forms/checkout-form";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPlanBySlug, getPlanPresentation, type PublicPlanSlug } from "@/lib/plans";
import { currency } from "@/lib/utils";

export default async function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const selectedPlan = getPlanBySlug(plan);

  if (!selectedPlan) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
        <PremiumCard className="w-full space-y-6 border-rose-200">
          <div>
            <StatusBadge tone="danger">Plano indisponivel</StatusBadge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Este checkout nao esta mais disponivel</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Volte para os planos para escolher uma opcao valida e seguir pelo novo funil comercial.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/pricing">Ver planos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Voltar ao inicio</Link>
            </Button>
          </div>
        </PremiumCard>
      </main>
    );
  }

  const presentation = getPlanPresentation(selectedPlan);
  const planSlug = plan as PublicPlanSlug;

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Checkout seguro via ASAAS
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Resumo do pedido</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                {selectedPlan.name} para acelerar atendimento, pagamento e primeiro acesso
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">{selectedPlan.description}</p>
            </div>

            <PremiumCard className="overflow-hidden p-0">
              <div className="border-b border-emerald-100 bg-white/92 px-6 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <StatusBadge tone="success">{presentation.badge}</StatusBadge>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{selectedPlan.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{presentation.messageLimit}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-4xl font-semibold text-slate-950">{currency(selectedPlan.priceCents / 100)}</p>
                    <p className="text-sm font-medium text-slate-500">/mes recorrente</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {selectedPlan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </PremiumCard>

            <div className="grid gap-4 sm:grid-cols-2">
              <PremiumCard className="space-y-3">
                <LockKeyhole className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Ambiente seguro</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Nenhum dado de pagamento fica exposto no app. O processamento continua no ASAAS.
                  </p>
                </div>
              </PremiumCard>
              <PremiumCard className="space-y-3">
                <Sparkles className="h-5 w-5 text-violet-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Fluxo unico</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Conta, tenant e assinatura pendente ficam alinhados no mesmo envio.
                  </p>
                </div>
              </PremiumCard>
            </div>
          </section>

          <section className="space-y-4">
            <PremiumCard className="border-white/80 bg-white/95">
              <div className="mb-6">
                <StatusBadge tone="brand">Criacao de conta + pagamento</StatusBadge>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Siga para o pagamento seguro</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Se voce entrou por um link direto, pode concluir tudo aqui. Se preferir, volte para a etapa de cadastro com
                  o plano selecionado.
                </p>
              </div>
              <CheckoutForm plan={planSlug} mode="checkout" />
            </PremiumCard>
            <div className="rounded-[28px] border border-violet-100 bg-white/85 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Quer usar o funil principal de aquisicao?</p>
              <p className="mt-2 leading-6">
                O caminho recomendado agora comeca no cadastro integrado ao plano, para manter contexto comercial desde a
                escolha ate o checkout.
              </p>
              <Button asChild variant="secondary" className="mt-4 w-full sm:w-auto">
                <Link href={`/signup?plan=${planSlug}`}>
                  Ir para signup com plano selecionado
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
