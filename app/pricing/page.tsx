import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CATALOG } from "@/lib/plans";
import { currency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Planos</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Escolha o plano ideal para atender melhor e vender com mais constancia</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Comece com o essencial, valide sua operacao no WhatsApp e evolua quando quiser ganhar mais volume, contexto e automacao.
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PLAN_CATALOG.map((plan) => (
          <Card key={plan.id} className={plan.code === "PRO" ? "border-emerald-200 shadow-2xl shadow-emerald-900/10" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-4xl font-semibold text-slate-950">
                {currency(plan.priceCents / 100)}
                <span className="text-base font-medium text-slate-500">/mes</span>
              </p>
              <p className="text-sm leading-6 text-slate-600">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={plan.code === "PRO" ? "default" : "secondary"}>
                <Link href="/signup">{plan.code === "PRO" ? "Quero este plano" : "Comecar por aqui"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
