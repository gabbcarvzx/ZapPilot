import React from "react";
import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { CheckoutForm } from "@/components/forms/checkout-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanBySlug } from "@/lib/plans";
import { currency } from "@/lib/utils";

export default async function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = await params;
  const selectedPlan = getPlanBySlug(plan);

  if (!selectedPlan) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
        <Card className="w-full border-rose-200 bg-white/95">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-950">Plano indisponivel</CardTitle>
            <CardDescription>
              Este link nao esta mais valido. Volte para os planos e escolha uma opcao ativa para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/pricing">Ver planos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Voltar ao inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Pagamento seguro via ASAAS
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Checkout do plano</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                {selectedPlan.name} para vender com mais ritmo no WhatsApp
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">{selectedPlan.description}</p>
            </div>

            <Card className="border-emerald-100 bg-white/90">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-slate-950">{selectedPlan.name}</CardTitle>
                    <CardDescription>Assinatura mensal com ativacao automatica apos confirmacao do pagamento.</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-semibold text-slate-950">{currency(selectedPlan.priceCents / 100)}</p>
                    <p className="text-sm font-medium text-slate-500">/mes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  {selectedPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <p>
                    Seu acesso sera liberado assim que o ASAAS confirmar a assinatura. Se a conta ja estiver ativa, voce
                    segue direto para o painel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-white/80 bg-white/95">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-950">Criar conta e seguir para o pagamento</CardTitle>
                <CardDescription>
                  Preencha seus dados uma vez. Em seguida voce sera levado para concluir a assinatura com seguranca.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutForm plan={plan as "start" | "pro" | "premium"} />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
