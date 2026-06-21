import React from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { PLAN_CATALOG } from "@/lib/plans";
import { currency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <SectionHeading
        eyebrow="Planos"
        title="Escolha o plano ideal para transformar seu WhatsApp em uma operacao comercial mais profissional"
        description="Cancele quando quiser, pague com seguranca e evolua o atendimento do seu negocio no ritmo certo."
      />

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <StatusBadge tone="success">Pagamento seguro</StatusBadge>
        <StatusBadge tone="brand">Suporte em portugues</StatusBadge>
        <StatusBadge tone="neutral">Cancele quando quiser</StatusBadge>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PLAN_CATALOG.map((plan) => {
          const isPopular = plan.code === "PRO";

          return (
            <PremiumCard
              key={plan.id}
              className={isPopular ? "relative border-violet-300 shadow-[0_30px_90px_-40px_rgba(76,29,149,0.34)]" : ""}
            >
              {isPopular ? <StatusBadge tone="brand" className="mb-4">Mais popular</StatusBadge> : null}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{plan.name}</h2>
                <p className="mt-3 text-4xl font-semibold text-slate-950">
                  {currency(plan.priceCents / 100)}
                  <span className="text-base font-medium text-slate-500">/mes</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3">
                <Button asChild className="w-full" variant={isPopular ? "default" : "secondary"}>
                  <Link href="/signup">{isPopular ? "Comecar com o Pro" : `Escolher ${plan.name}`}</Link>
                </Button>
                <p className="text-xs leading-5 text-slate-500">Pagamento seguro, ativacao assistida e estrutura pronta para demonstracao e venda real.</p>
              </div>
            </PremiumCard>
          );
        })}
      </div>
    </main>
  );
}
