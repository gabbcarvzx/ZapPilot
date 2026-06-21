"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormFeedback, type FormFeedbackState } from "@/components/ui/form-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestJson } from "@/lib/client-request";

interface CheckoutFormProps {
  plan: "start" | "pro" | "premium";
}

function navigate(router: ReturnType<typeof useRouter>, target: string) {
  if (/^https?:\/\//i.test(target)) {
    window.location.assign(target);
    return;
  }

  router.push(target);
  router.refresh();
}

export function CheckoutForm({ plan }: CheckoutFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      plan,
      name: String(formData.get("name") ?? ""),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormFeedback state={feedback} />
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" placeholder="Seu nome completo" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="11999999999" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
          <Input id="cpfCnpj" name="cpfCnpj" placeholder="Somente numeros" required />
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
        {loading ? "Redirecionando..." : "Ir para pagamento seguro"}
      </Button>
      <p className="text-center text-xs leading-5 text-slate-500">
        Seus dados sao usados apenas para criar sua conta e liberar sua assinatura com seguranca.
      </p>
    </form>
  );
}
