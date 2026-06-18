import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_CATALOG } from "@/lib/plans";
import { currency } from "@/lib/utils";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Planos</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Escolha o plano ideal para o momento do seu negócio</h1>
        <p className="mt-4 text-slate-600">Comece simples, valide a operação e suba de nível quando quiser capturar mais leads e automatizar com IA.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {PLAN_CATALOG.map((plan) => (
          <Card key={plan.id} className={plan.code === "PRO" ? "border-teal-300" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-4xl font-semibold">{currency(plan.priceCents / 100)}<span className="text-base font-medium text-slate-500">/mês</span></p>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={plan.code === "PRO" ? "default" : "secondary"}>
                <Link href="/signup">Começar agora</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
