import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareText, ShieldCheck, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { PLAN_CATALOG, getPlanPresentation, getPlanSlug } from "@/lib/plans";
import { currency } from "@/lib/utils";

const trustMicrocopy = ["Cancele quando quiser", "Pagamento seguro", "Setup guiado para venda"];

const socialProof = [
  { value: "+2,5 mil", label: "mensagens suportadas no plano mais escolhido" },
  { value: "5 etapas", label: "de onboarding no primeiro acesso" },
  { value: "1 fluxo", label: "da escolha do plano ate o checkout" }
];

const commercialFaqs = [
  {
    question: "Quando minha conta e liberada?",
    answer: "Assim que a assinatura for confirmada, seu dashboard continua com o onboarding premium e os recursos pagos podem ser ativados."
  },
  {
    question: "Consigo comecar sem equipe tecnica?",
    answer: "Sim. O fluxo foi desenhado para criar conta, empresa e assinatura em poucos minutos, sem setup tecnico no primeiro passo."
  },
  {
    question: "O WhatsApp real ativa na hora?",
    answer: "A estrutura do canal pode ser preparada antes, mas o uso comercial real so libera depois da confirmacao segura do plano."
  }
];

export default function PricingPage() {
  const recommendedPlan = PLAN_CATALOG.find((plan) => plan.code === "PRO") ?? PLAN_CATALOG[0];
  const recommendedPlanPresentation = getPlanPresentation(recommendedPlan);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(76,29,149,0.14),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f6f1ff_46%,_#ffffff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-16">
        <SectionHeading
          eyebrow="Planos"
          title="Escolha o plano e entre em um funil comercial mais claro, premium e pronto para converter."
          description="O plano agora acompanha todo o fluxo de aquisicao: escolha, cadastro, checkout e primeiro acesso. Sem perder contexto entre uma etapa e outra."
        />

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
          {trustMicrocopy.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/85 px-4 py-2 shadow-[0_18px_40px_-28px_rgba(76,29,149,0.2)]"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-[32px] border border-violet-100 bg-white/80 p-5 shadow-[0_32px_80px_-44px_rgba(76,29,149,0.28)] md:grid-cols-3">
          {socialProof.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-violet-100/80 bg-violet-50/60 px-5 py-5">
              <p className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLAN_CATALOG.map((plan) => {
            const presentation = getPlanPresentation(plan);
            const href = `/signup?plan=${getPlanSlug(plan.code)}`;
            const isPopular = plan.code === "PRO";

            return (
              <PremiumCard
                key={plan.id}
                className={
                  isPopular
                    ? "relative overflow-hidden border-violet-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f2ff_100%)] shadow-[0_30px_90px_-40px_rgba(76,29,149,0.34)]"
                    : "relative overflow-hidden"
                }
              >
                {isPopular ? <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#8b5cf6_0%,#6d28d9_100%)]" /> : null}
                <div className="flex h-full flex-col p-6 lg:p-7">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                        {isPopular ? <Sparkles className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                        {presentation.recommendedBadge ?? presentation.badge}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {presentation.messageLimit}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{plan.name}</h1>
                      <p className="text-sm leading-6 text-slate-600">{plan.description}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-semibold tracking-tight text-slate-950">
                        {currency(plan.priceCents / 100)}
                        <span className="ml-1 text-base font-medium text-slate-500">/mes</span>
                      </p>
                      <p className="text-sm text-slate-500">{presentation.heroLabel}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{presentation.includedLabel}</p>
                    <ul className="mt-3 space-y-3 text-sm text-slate-700">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 rounded-[24px] border border-amber-100 bg-amber-50/70 px-4 py-4 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p>{presentation.socialProof}</p>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3">
                    <Button asChild className="w-full" size="lg" variant={isPopular ? "default" : "secondary"}>
                      <Link href={href}>
                        {presentation.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="grid gap-2 text-center text-xs font-medium text-slate-500 sm:grid-cols-3">
                      <span>Signup com plano selecionado</span>
                      <span>Checkout via ASAAS</span>
                      <span>Dashboard com onboarding</span>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <PremiumCard className="overflow-hidden p-0">
            <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_58%,#6d28d9_100%)] px-6 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/80">Prova social comercial</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">O plano Pro virou a rota principal de conversao.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-violet-100/85">
                Ele equilibra IA, historico, captura de leads e operacao suficiente para vender bem sem entrar no custo do Business cedo demais.
              </p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Mais escolhido</p>
                <p className="mt-2 text-sm font-medium text-slate-950">Plano Pro</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Melhor custo-beneficio para validar atendimento e monetizacao.</p>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Onboarding premium</p>
                <p className="mt-2 text-sm font-medium text-slate-950">Empresa, produtos, FAQ, WhatsApp e teste</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">O primeiro acesso agora deixa claro o progresso da operacao.</p>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Checkout unico</p>
                <p className="mt-2 text-sm font-medium text-slate-950">Conta, tenant e pagamento em uma jornada</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Menos friccao entre cadastro e receita recorrente.</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">FAQ comercial</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Perguntas que destravam a conversao</h2>
            <div className="mt-6 space-y-4">
              {commercialFaqs.map((item) => (
                <div key={item.question} className="rounded-3xl border border-violet-100 bg-white/85 p-5">
                  <p className="text-base font-semibold text-slate-950">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[28px] border border-violet-200 bg-violet-50/80 p-5">
              <p className="text-sm font-semibold text-slate-950">Pronto para seguir pelo plano recomendado?</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Comece pelo {recommendedPlan.name}, crie sua conta uma unica vez e conclua o pagamento com checkout seguro.
              </p>
              <Button asChild className="mt-4 w-full sm:w-auto">
                <Link href={`/signup?plan=${getPlanSlug(recommendedPlan.code)}`}>
                  {recommendedPlanPresentation.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </PremiumCard>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-20 lg:hidden">
        <Link
          href={`/signup?plan=${getPlanSlug(recommendedPlan.code)}`}
          className="flex items-center justify-between rounded-[24px] bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-[0_28px_80px_-34px_rgba(15,23,42,0.65)]"
        >
          <span>Comecar agora no plano {recommendedPlan.name}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
