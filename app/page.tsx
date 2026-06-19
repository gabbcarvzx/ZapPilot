import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, MessageCircleHeart, ShieldCheck, Store, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const segments = ["Hamburguerias", "Barbearias", "Saloes", "Lojas", "Clinicas", "Prestadores de servico"];

const benefits = [
  {
    title: "Responda sem parar o atendimento",
    description: "O ZapPilot responde perguntas comuns, apresenta produtos e segura a conversa enquanto voce esta ocupado.",
    Icon: Clock3
  },
  {
    title: "Venda com mais consistencia",
    description: "Mensagem de boas-vindas, horario, produto e FAQ ficam organizados para a conversa parecer profissional.",
    Icon: TrendingUp
  },
  {
    title: "Centralize tudo em um painel simples",
    description: "Empresa, WhatsApp, IA, conversas e plano ficam no mesmo lugar, sem depender de varios sistemas.",
    Icon: Store
  },
  {
    title: "Transmita confianca desde a primeira resposta",
    description: "O cliente recebe retorno rapido, com tom comercial claro e opcao de atendimento humano quando necessario.",
    Icon: MessageCircleHeart
  }
];

const testimonials = [
  {
    quote: "Na demo eu consegui enxergar exatamente como a barbearia responderia no WhatsApp sem parecer robo.",
    author: "Rafael, dono de barbearia"
  },
  {
    quote: "A conversa ficou com cara de empresa organizada. Isso ja muda a percepcao de quem pede preco pelo WhatsApp.",
    author: "Marina, dona de loja"
  },
  {
    quote: "O mais forte foi ver produto, horario e mensagem comercial funcionando juntos em poucos minutos.",
    author: "Claudia, gestora de clinica"
  }
];

const commercialFaq = [
  {
    question: "Isso serve mesmo para negocio local?",
    answer: "Sim. O ZapPilot foi desenhado para empresas que dependem de WhatsApp para vender, tirar duvidas e organizar a primeira resposta."
  },
  {
    question: "Preciso configurar Meta no primeiro minuto?",
    answer: "Nao. Voce pode apresentar tudo em modo demonstracao e ativar o canal real quando o numero comercial estiver pronto."
  },
  {
    question: "Ele substitui atendimento humano?",
    answer: "Nao. Ele acelera o basico, melhora resposta comercial e encaminha para atendimento humano quando a conversa pede isso."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
      <section className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            Feito para empresas que vendem pelo WhatsApp
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
              Seu WhatsApp atendendo clientes automaticamente, mesmo quando voce esta ocupado.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              O ZapPilot ajuda empresas locais a responder mais rapido, passar mais confianca e vender melhor no WhatsApp sem parecer improviso.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Quero ver funcionando
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-slate-200/70 bg-white">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-slate-950">1a</p>
                <p className="mt-2 text-sm text-slate-600">Resposta que ja parece atendimento de empresa organizada.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-slate-950">3x</p>
                <p className="mt-2 text-sm text-slate-600">Mais clareza para explicar produto, horario e proximo passo.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200/70 bg-white">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-slate-950">24h</p>
                <p className="mt-2 text-sm text-slate-600">Seu painel pronto para operar e demonstrar com seguranca.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            {segments.map((segment) => (
              <span key={segment} className="rounded-full border border-slate-200 bg-white px-3 py-2 font-medium">
                {segment}
              </span>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200/70 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Conversa de demonstracao</p>
                <p className="text-xs text-slate-400">Mostre a experiencia que o cliente vai sentir no WhatsApp</p>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Pronto para demonstrar</div>
            </div>
            <div className="space-y-4 p-6">
              <div className="ml-auto max-w-xs rounded-3xl bg-amber-400 px-4 py-3 text-sm font-medium text-slate-950">
                Oi, queria saber o preco da pizza grande e se voces entregam rapido.
              </div>
              <div className="max-w-sm rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                Temos pizza grande a partir de R$ 54,90 e entrega media entre 35 e 50 minutos. Se quiser, eu te mostro os sabores mais pedidos agora.
              </div>
              <div className="ml-auto max-w-xs rounded-3xl bg-amber-400 px-4 py-3 text-sm font-medium text-slate-950">
                Voces atendem ate as 23h?
              </div>
              <div className="max-w-sm rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                Sim. Nosso atendimento funciona ate as 23h. Se preferir, eu tambem posso encaminhar seu pedido para a equipe finalizar com voce.
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">O que essa tela prova na demonstracao</p>
                <ul className="mt-2 space-y-2">
                  <li>1. A empresa responde rapido mesmo em horario corrido.</li>
                  <li>2. O cliente entende preco, prazo e proximo passo sem ficar perdido.</li>
                  <li>3. O atendimento parece comercial, nao tecnico.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map(({ title, description, Icon }) => (
          <Card key={title}>
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

      <section className="py-18">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Prova social</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">O produto precisa parecer confiavel logo na primeira demonstracao</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            Linguagem comercial, painel organizado e ativacao guiada
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.author}>
              <CardContent className="p-6">
                <BadgeCheck className="h-5 w-5 text-amber-500" />
                <p className="mt-4 text-base leading-7 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-slate-950">{item.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[40px] bg-slate-950 px-6 py-10 text-white lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Por que contratar</p>
            <h2 className="mt-3 text-3xl font-semibold">Se o seu WhatsApp ja vende, ele precisa responder bem mesmo quando voce nao consegue parar.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              O ZapPilot organiza a primeira resposta da sua empresa para que preco, horario, produto, FAQ e encaminhamento humano funcionem com mais consistencia.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Menos demora</p>
              <p className="mt-2 text-sm text-slate-300">O lead nao fica esperando o dono ter tempo para responder o basico.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Mais clareza</p>
              <p className="mt-2 text-sm text-slate-300">A conversa passa preco, horario e proximo passo com menos improviso.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Mais percepcao de valor</p>
              <p className="mt-2 text-sm text-slate-300">O cliente sente que esta falando com uma empresa organizada.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Mais controle</p>
              <p className="mt-2 text-sm text-slate-300">Voce visualiza status, integracoes e conversas em um unico lugar.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-18">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Planos</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Escolha o ritmo de automacao que acompanha sua empresa</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/pricing">Comparar planos</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Comecar demonstracao</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/pricing">Ver investimento mensal</Link>
          </Button>
        </div>
      </section>

      <section className="pb-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">FAQ comercial</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Perguntas que surgem antes de contratar</h2>
        </div>
        <div className="grid gap-4">
          {commercialFaq.map((item) => (
            <Card key={item.question}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
