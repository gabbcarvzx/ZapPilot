import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquareQuote, ShieldCheck, TrendingUp, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";

const trustSignals = ["Pagamento seguro", "Configuracao assistida", "Feito para negocios locais", "Suporte em portugues"];

const metrics = [
  { label: "Primeira resposta", value: "Em segundos", description: "Ganhe velocidade logo no primeiro contato." },
  { label: "Operacao comercial", value: "Mais clara", description: "Preco, prazo e proximo passo ficam organizados." },
  { label: "Atendimento", value: "Todos os dias", description: "Sua empresa segue preparada mesmo fora do expediente." }
];

const benefits = [
  {
    title: "Automatize atendimentos com mais clareza",
    description: "Organize respostas, mensagens iniciais e orientacoes comerciais para o cliente entender rapido o que fazer.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    title: "Passe mais confianca no WhatsApp",
    description: "Seu negocio responde com mais consistencia e parece uma operacao profissional desde a primeira mensagem.",
    icon: <ShieldCheck className="h-5 w-5" />
  },
  {
    title: "Venda melhor com processo simples",
    description: "O ZapPilot ajuda a conduzir a conversa para catalogo, pedido, horario e encaminhamento humano na hora certa.",
    icon: <TrendingUp className="h-5 w-5" />
  }
];

const steps = [
  {
    title: "Cadastre a empresa e o contexto comercial",
    description: "Defina nome, nicho, horarios e mensagens base para o atendimento soar natural."
  },
  {
    title: "Monte sua operacao no WhatsApp",
    description: "Prepare catalogo, FAQ e canal para demonstrar valor antes mesmo da ativacao final."
  },
  {
    title: "Conduza atendimentos com mais consistencia",
    description: "A conversa fica mais clara, profissional e pronta para evoluir ate a venda."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
      <section className="grid gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
        <div className="space-y-8">
          <div className="space-y-5">
            <StatusBadge tone="brand">SaaS para atendimento comercial no WhatsApp</StatusBadge>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-[4.15rem]">
              Automatize atendimentos, responda clientes e venda mais pelo WhatsApp.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              O ZapPilot transforma o WhatsApp do seu negocio em um atendente automatico, organizado e pronto para vender todos os dias.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/pricing">
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12 px-6 text-base">
              <Link href="/login">Entrar no painel</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustSignals.map((signal) => (
              <div key={signal} className="rounded-2xl border border-violet-100 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm shadow-violet-900/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {signal}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} description={item.description} />
            ))}
          </div>
        </div>

        <PremiumCard className="overflow-hidden p-0">
          <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#24153f_0%,#4c1d95_100%)] px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Visao da conversa automatizada</p>
                <p className="mt-1 text-sm text-violet-100/80">Moderno, rapido e confiavel para quem quer vender mais pelo WhatsApp.</p>
              </div>
              <StatusBadge tone="success" className="bg-emerald-400/15 text-emerald-100 ring-emerald-300/20">
                Pagamento seguro via ASAAS
              </StatusBadge>
            </div>
          </div>

          <div className="space-y-4 bg-[linear-gradient(180deg,#fcfbff_0%,#f2ecff_100%)] p-6">
            <div className="flex justify-end">
              <div className="max-w-[19rem] rounded-[26px] rounded-br-md bg-violet-600 px-4 py-3 text-sm font-medium leading-6 text-white shadow-lg shadow-violet-900/15">
                Oi, queria saber se voces atendem hoje e quanto custa o plano Pro.
              </div>
            </div>
            <div className="max-w-[21rem] rounded-[26px] rounded-bl-md border border-violet-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm shadow-violet-900/5">
              Atendemos hoje sim. O plano Pro custa R$97 por mes e e ideal para negocios que querem mais contexto, historico e automacao comercial.
            </div>
            <div className="flex justify-end">
              <div className="max-w-[19rem] rounded-[26px] rounded-br-md bg-violet-600 px-4 py-3 text-sm font-medium leading-6 text-white shadow-lg shadow-violet-900/15">
                E como eu comeco?
              </div>
            </div>
            <div className="max-w-[21rem] rounded-[26px] rounded-bl-md border border-violet-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm shadow-violet-900/5">
              Voce escolhe o plano, cria sua conta e segue direto para um checkout seguro. Depois disso, o dashboard abre um onboarding premium para ativar sua operacao.
            </div>
            <div className="rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-sm shadow-violet-900/5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">Por que esse visual vende melhor</p>
                  <p className="text-sm text-slate-600">A conversa parece produto real, reduz inseguranca e acelera a decisao comercial.</p>
                </div>
              </div>
            </div>
          </div>
        </PremiumCard>
      </section>

      <section className="py-10 lg:py-14">
        <SectionHeading
          eyebrow="Beneficios"
          title="Uma estrutura mais profissional para atender e vender pelo WhatsApp"
          description="Da primeira resposta ao encaminhamento humano, tudo fica mais claro para sua equipe e para o cliente."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <PremiumCard key={benefit.title} className="space-y-4">
              <div className="inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">{benefit.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <SectionHeading
          eyebrow="Como funciona"
          title="Em poucos passos, seu atendimento ganha mais organizacao e mais cara de operacao real"
          description="O fluxo foi desenhado para negocios locais que precisam vender bem sem depender de uma estrutura tecnica complexa."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <PremiumCard key={step.title} className="space-y-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">{index + 1}</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="pb-4">
        <PremiumCard className="overflow-hidden border-0 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_52%,#6d28d9_100%)] p-8 text-white shadow-[0_24px_80px_-36px_rgba(76,29,149,0.62)] lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-100/80">Pronto para vender melhor</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-[2.15rem]">Seu atendimento pode parecer mais profissional antes mesmo da primeira integracao real.</h2>
              <p className="mt-3 text-base leading-7 text-violet-100/85">
                Use o ZapPilot para mostrar valor rapido, organizar o comercial e preparar uma operacao mais confiavel no WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
                <Link href="/pricing">Comecar agora</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/30 px-6 text-base text-white hover:bg-white/10">
                <Link href="/login">Entrar no painel</Link>
              </Button>
            </div>
          </div>
        </PremiumCard>
      </section>
    </main>
  );
}
