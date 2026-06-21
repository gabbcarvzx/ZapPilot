import React from "react";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { PLAN_CATALOG } from "@/lib/plans";
import { currency } from "@/lib/utils";

const PLAN_CHECKOUT_SLUGS = {
  PREMIUM: "premium",
  PRO: "pro",
  START: "start"
} as const;

const trustMicrocopy = ["Cancele quando quiser", "Pagamento seguro", "Suporte em portugues"];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6 lg:py-16">
      <SectionHeading
        eyebrow="Planos"
        title="Escolha o plano ideal para vender mais com um WhatsApp mais profissional"
        description="Compare os planos, escolha a melhor fase para o seu negocio e avance para um checkout mais claro, confiavel e pronto para assinatura recorrente."
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

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PLAN_CATALOG.map((plan) => {
          const isPopular = plan.code === "PRO";

          return (
            <PremiumCard
              key={plan.id}
              className={
                isPopular
                  ? "relative overflow-hidden border-violet-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f2ff_100%)] shadow-[0_30px_90px_-40px_rgba(76,29,149,0.34)]"
                  : "p-0"
              }
            >
              {isPopular ? <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#8b5cf6_0%,#6d28d9_100%)]" /> : null}
              <div className="flex h-full flex-col p-6 lg:p-7">
                <div className="space-y-4">
                  {isPopular ? (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Plano recomendado
                    </div>
                  ) : null}
                  {isPopular ? (
                    <div className="hidden">
                      Mais popular
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{plan.name}</h1>
                    <p className="text-sm leading-6 text-slate-600">{plan.description}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-semibold tracking-tight text-slate-950">
                      {currency(plan.priceCents / 100)}
                      <span className="ml-1 text-base font-medium text-slate-500">/mes</span>
                    </p>
                    <p className="text-sm text-slate-500">Assinatura mensal com ativacao comercial apos confirmacao.</p>
                  </div>
                </div>

                <ul className="mt-7 space-y-3 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 space-y-3">
                  <Button asChild className="w-full" size="lg" variant={isPopular ? "default" : "secondary"}>
                    <Link href={`/checkout/${PLAN_CHECKOUT_SLUGS[plan.code]}`}>{`Comprar ${plan.name}`}</Link>
                  </Button>
                  <div className="grid gap-2 text-center text-xs font-medium text-slate-500 sm:grid-cols-3">
                    <span>Cancele quando quiser</span>
                    <span>Pagamento seguro</span>
                    <span>Suporte em portugues</span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </main>
  );
}
