"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormFeedback, type FormFeedbackState } from "@/components/ui/form-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/premium-card";
import { requestJson } from "@/lib/client-request";
import { currency } from "@/lib/utils";
import { getPlanBySlug, getPlanPresentation, type PublicPlanSlug } from "@/lib/plans";

interface CheckoutFormProps {
  plan: PublicPlanSlug;
  mode?: "signup" | "checkout";
}

function navigate(router: ReturnType<typeof useRouter>, target: string) {
  if (/^https?:\/\//i.test(target)) {
    window.location.assign(target);
    return;
  }

  router.push(target);
  router.refresh();
}

export function CheckoutForm({ plan, mode = "checkout" }: CheckoutFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedPlan = getPlanBySlug(plan);
  const presentation = selectedPlan ? getPlanPresentation(selectedPlan) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      plan,
      name: String(formData.get("name") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      cpfCnpj: String(formData.get("cpfCnpj") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? "")
    };

    if (payload.password !== payload.confirmPassword) {
      setFeedback({
        tone: "danger",
        title: "Falha ao validar",
        message: "As senhas nao coincidem."
      });
      return;
    }

    setLoading(true);

    try {
      const result = await requestJson<{
        checkoutUrl?: string | null;
        redirectTo?: string;
      }>(
        "/api/billing/checkout",
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        },
        "Nao foi possivel iniciar o checkout agora."
      );

      const authResult = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false
      });

      if (authResult?.error) {
        setFeedback({
          tone: "danger",
          title: "Conta criada, mas o acesso nao foi iniciado",
          message: "Refaca o envio para retomar o checkout com sua sessao autenticada."
        });
        setLoading(false);
        return;
      }

      const target = result.checkoutUrl ?? result.redirectTo;
      if (!target) {
        setFeedback({
          tone: "danger",
          title: "Falha ao redirecionar",
          message: "Nao foi possivel direcionar para o pagamento agora."
        });
        setLoading(false);
        return;
      }

      navigate(router, target);
    } catch (error) {
      setFeedback({
        tone: "danger",
        title: "Falha ao iniciar checkout",
        message: error instanceof Error ? error.message : "Falha inesperada ao iniciar checkout."
      });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {mode === "signup" && selectedPlan && presentation ? (
        <PremiumCard className="overflow-hidden border-violet-200/70 bg-[linear-gradient(135deg,rgba(76,29,149,0.08),rgba(255,255,255,0.96))] p-0">
          <div className="border-b border-violet-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">Plano selecionado</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{selectedPlan.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedPlan.description}</p>
              </div>
              <div className="rounded-3xl border border-violet-200 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Valor mensal</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{currency(selectedPlan.priceCents / 100)}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Capacidade</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{presentation.messageLimit}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pagamento</p>
              <p className="mt-2 text-sm font-medium text-slate-950">Recorrencia mensal via ASAAS</p>
            </div>
            {selectedPlan.features.slice(0, 4).map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-sm text-slate-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormFeedback state={feedback} />
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" placeholder="Seu nome completo" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Nome da empresa</Label>
          <Input id="businessName" name="businessName" placeholder="Como sua empresa sera exibida" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="11999999999" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
            <Input id="cpfCnpj" name="cpfCnpj" placeholder="Somente numeros" required />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
              <p>
                Ao continuar, criamos sua conta, seu tenant e a assinatura pendente em uma unica etapa segura.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" placeholder="Crie sua senha" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              required
              minLength={8}
            />
          </div>
        </div>
        <Button className="w-full" type="submit" size="lg" disabled={loading}>
          {loading ? "Criando conta e redirecionando..." : "Comecar agora"}
        </Button>
        <div className="flex flex-col gap-2 text-center text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-center">
          <span className="inline-flex items-center justify-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5" />
            Ambiente seguro
          </span>
          <span className="hidden text-slate-300 sm:inline">•</span>
          <span>Pagamento processado pelo ASAAS</span>
          <span className="hidden text-slate-300 sm:inline">•</span>
          <span>Nenhum login manual adicional</span>
        </div>
      </form>
    </div>
  );
}
