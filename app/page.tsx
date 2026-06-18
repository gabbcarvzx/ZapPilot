import Link from "next/link";
import { ArrowRight, Bot, ChartNoAxesColumn, Clock3, MessageCircleHeart, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLAN_CATALOG } from "@/lib/plans";
import { currency } from "@/lib/utils";

const niches = ["Hamburguerias", "Pizzarias", "Barbearias", "Salões", "Clínicas", "Lojas", "Oficinas", "Delivery", "Prestadores de serviço"];
const benefitCards = [
  {
    title: "Responde rápido",
    description: "Atenda clientes mesmo durante correria no balcão.",
    Icon: Clock3
  },
  {
    title: "Vende melhor",
    description: "Conduza pedidos e dúvidas com tom comercial.",
    Icon: ChartNoAxesColumn
  },
  {
    title: "Centraliza o fluxo",
    description: "Negócio, catálogo, FAQs e histórico no mesmo painel.",
    Icon: Store
  },
  {
    title: "Entrega experiência",
    description: "Misture automação, IA e handoff humano sem fricção.",
    Icon: MessageCircleHeart
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
      <section className="grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
            Atendimento automático para comércios locais
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Transforme seu WhatsApp em um atendente automático que responde clientes, tira dúvidas e ajuda a vender todos os dias.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            O ZapPilot Local ajuda pequenos negócios a responder clientes, capturar pedidos e vender mais, mesmo quando o dono está ocupado.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            {niches.map((niche) => (
              <span key={niche} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2">
                {niche}
              </span>
            ))}
          </div>
        </div>
        <Card className="overflow-hidden bg-slate-950 text-white">
          <CardContent className="p-0">
            <div className="rounded-t-[28px] border-b border-white/10 bg-white/5 px-6 py-4">
              <p className="text-sm text-slate-300">Demonstração visual do chat</p>
            </div>
            <div className="space-y-4 p-6">
              <div className="ml-auto max-w-xs rounded-3xl bg-teal-500 px-4 py-3 text-sm">
                Oi, queria saber o preço da pizza grande.
              </div>
              <div className="max-w-sm rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                Temos pizza grande a partir de R$ 54,90. Se quiser, já te mostro os sabores mais pedidos e o tempo médio de entrega.
              </div>
              <div className="ml-auto max-w-xs rounded-3xl bg-teal-500 px-4 py-3 text-sm">
                Vocês entregam até as 23h?
              </div>
              <div className="max-w-sm rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                Sim. Nosso delivery funciona até as 23h. Se quiser, posso encaminhar seu pedido para finalizar com atendimento humano.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {benefitCards.map(({ title, description, Icon }) => (
          <Card key={title}>
            <CardContent className="space-y-4 p-6">
              <div className="inline-flex rounded-2xl bg-teal-100 p-3 text-teal-800">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Planos</p>
            <h2 className="mt-2 text-3xl font-semibold">Escolha o nível de automação que faz sentido para o seu negócio</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/pricing">Ver comparação completa</Link>
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLAN_CATALOG.map((plan) => (
            <Card key={plan.id} className={plan.code === "PRO" ? "border-teal-200 shadow-2xl shadow-teal-900/10" : ""}>
              <CardContent className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{plan.name}</p>
                <div className="mt-3 text-4xl font-semibold">{currency(plan.priceCents / 100)}</div>
                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Bot className="mt-0.5 h-4 w-4 text-teal-700" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
