import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageCircleHeart,
  ShieldCheck,
  Store,
  TrendingUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trustSignals = [
  "Pronto para demonstração",
  "Ideal para delivery, lojas e serviços locais",
  "Configuração assistida",
  "Sem complicação técnica para o cliente"
];

const segments = ["Delivery", "Lojas", "Clínicas", "Barbearias", "Salões", "Serviços locais"];

const metrics = [
  {
    value: "1ª resposta",
    description: "O cliente recebe uma resposta rápida e organizada."
  },
  {
    value: "3x mais clareza",
    description: "Preço, horário e próximo passo ficam fáceis de entender."
  },
  {
    value: "24h organizado",
    description: "Seu atendimento fica pronto para responder mesmo fora do horário."
  }
];

const benefits = [
  {
    title: "Atenda com mais agilidade",
    description: "O ZapPilot responde dúvidas frequentes, apresenta produtos e mantém a conversa fluindo enquanto sua equipe está ocupada.",
    Icon: Clock3
  },
  {
    title: "Venda com mais confiança",
    description: "Preço, horário, prazo e próximo passo aparecem com clareza para o cliente entender rápido e seguir no atendimento.",
    Icon: TrendingUp
  },
  {
    title: "Organize a operação em um só lugar",
    description: "Empresa, WhatsApp, catálogos, mensagens e status de ativação ficam centralizados em uma estrutura simples de operar.",
    Icon: Store
  },
  {
    title: "Passe credibilidade logo no primeiro contato",
    description: "Sua empresa responde com mais consistência e encaminha o cliente para a equipe humana na hora certa.",
    Icon: MessageCircleHeart
  }
];

const steps = [
  {
    title: "Configure sua operação",
    description: "Organize empresa, horário, catálogo e perguntas frequentes para o ZapPilot responder do jeito certo."
  },
  {
    title: "Apresente uma resposta mais profissional",
    description: "A primeira mensagem já mostra preço, prazo e próximos passos com mais clareza para o cliente."
  },
  {
    title: "Encaminhe quando a equipe precisar assumir",
    description: "Quando a conversa pede fechamento ou exceção, o atendimento segue para a equipe sem perder contexto."
  }
];

const niches = [
  {
    title: "Delivery",
    description: "Ajude o cliente a entender cardápio, faixa de preço, entrega e horário em poucos segundos."
  },
  {
    title: "Lojas",
    description: "Explique produto, disponibilidade e como continuar a compra com uma conversa mais clara."
  },
  {
    title: "Serviços locais",
    description: "Orçamentos, horários e confirmação de atendimento ficam mais organizados para o cliente."
  }
];

const commercialFaq = [
  {
    question: "Isso funciona para negócios locais?",
    answer: "Sim. O ZapPilot foi pensado para comércios locais que usam o WhatsApp para responder, vender e organizar pedidos com mais consistência."
  },
  {
    question: "Preciso entender de tecnologia para usar?",
    answer: "Não. A configuração é assistida e a proposta é justamente simplificar a operação para quem quer vender melhor sem complicação técnica."
  },
  {
    question: "Ele substitui totalmente minha equipe?",
    answer: "Não. O objetivo é acelerar a primeira resposta, organizar a conversa e encaminhar o cliente para a equipe quando fizer sentido."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
      <section className="grid gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-18">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              Feito para empresas que vendem pelo WhatsApp
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.65rem]">
              Seu WhatsApp atendendo clientes e gerando vendas, mesmo quando você está ocupado.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              O ZapPilot ajuda comércios locais a responder clientes mais rápido, organizar pedidos e não perder oportunidades no WhatsApp.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/signup">
                Quero atender melhor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-12 px-6 text-base">
              <Link href="#demonstracao">Ver demonstração</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/5"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>{signal}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((item) => (
              <Card key={item.value} className="border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5">
                <CardContent className="space-y-2 p-5">
                  <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {segments.map((segment) => (
              <span key={segment} className="rounded-full border border-slate-200 bg-white px-3 py-2 font-medium shadow-sm shadow-slate-900/5">
                {segment}
              </span>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-[0_32px_90px_-42px_rgba(15,23,42,0.55)]">
          <CardContent className="space-y-0 p-0">
            <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Visão comercial da conversa</p>
                  <p className="mt-1 text-sm text-slate-300">Veja como o atendimento pode soar mais claro, rápido e confiável.</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Pronto para demonstração</span>
              </div>
            </div>
            <div className="space-y-4 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-6">
              <div className="flex justify-end">
                <div className="max-w-[18rem] rounded-[26px] rounded-br-md bg-emerald-500 px-4 py-3 text-sm font-medium leading-6 text-white shadow-sm">
                  Oi, queria saber o preço da pizza grande e se vocês entregam.
                </div>
              </div>
              <div className="max-w-[20rem] rounded-[26px] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                Claro! A pizza grande sai a partir de R$54,90. A entrega média fica entre 35 e 50 minutos. Posso te mostrar os sabores mais pedidos?
              </div>
              <div className="flex justify-end">
                <div className="max-w-[18rem] rounded-[26px] rounded-br-md bg-emerald-500 px-4 py-3 text-sm font-medium leading-6 text-white shadow-sm">
                  Vocês atendem até as 23h?
                </div>
              </div>
              <div className="max-w-[20rem] rounded-[26px] rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                Sim, atendemos até as 23h. Se quiser, posso encaminhar seu pedido para a equipe finalizar com você.
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-sm text-slate-200 shadow-sm">
                <p className="font-semibold text-white">Por que essa demonstração gera mais confiança</p>
                <ul className="mt-3 space-y-2 leading-6">
                  <li>1. O cliente entende preço, prazo e próximo passo sem esforço.</li>
                  <li>2. A conversa parece atendimento real de empresa organizada.</li>
                  <li>3. O encaminhamento humano continua claro quando a venda avança.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="demonstracao" className="py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Demonstração</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-[2.15rem]">
              Mostre para o cliente uma operação mais organizada antes mesmo de ativar o número oficial
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A landing deixa claro o que o ZapPilot resolve para negócios locais: responder mais rápido, passar mais confiança e manter o atendimento comercial funcionando.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 text-sm text-slate-600 shadow-sm shadow-slate-900/5">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Sem complicação técnica para o cliente
            </div>
            <p className="mt-2 max-w-sm leading-6">Configuração assistida, explicação simples e demonstração pronta para apresentar em vendas ou tráfego pago.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map(({ title, description, Icon }) => (
          <Card key={title} className="border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5">
            <CardContent className="space-y-4 p-6">
              <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Como funciona</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-[2.15rem]">Uma estrutura simples para atender melhor e vender com mais consistência</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5">
              <CardContent className="space-y-4 p-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] bg-slate-950 px-6 py-10 text-white lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Nichos atendidos</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[2.15rem]">Ideal para delivery, lojas e serviços locais que dependem do WhatsApp para vender</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              O ZapPilot foi desenhado para operações que precisam responder com rapidez, passar confiança e manter o atendimento funcionando mesmo quando a equipe está ocupada.
            </p>
          </div>
          <div className="grid gap-4">
            {niches.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Planos</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-[2.15rem]">Escolha o plano ideal para profissionalizar seu atendimento no WhatsApp</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A página de planos continua como destino de comparação, mas a landing agora prepara melhor o visitante para chegar lá com intenção comercial.
            </p>
          </div>
          <Button asChild variant="ghost" className="justify-start px-0 text-base text-emerald-800 hover:text-emerald-900">
            <Link href="/pricing">Conhecer planos</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/signup">Quero começar agora</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-12 px-6 text-base">
            <Link href="/pricing">Conhecer planos</Link>
          </Button>
        </div>
      </section>

      <section className="pb-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-[2.15rem]">Perguntas que surgem antes de começar</h2>
        </div>
        <div className="grid gap-4">
          {commercialFaq.map((item) => (
            <Card key={item.question} className="border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-4">
        <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.65)]">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Pronto para começar</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-[2.15rem]">Profissionalize seu atendimento no WhatsApp e transforme interesse em cadastro</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Use a demonstração para provar valor e leve o visitante direto para um cadastro com mais intenção de compra.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
              <Link href="/signup">
                Quero atender melhor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
