"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, Sparkles, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";

function FieldNote({ children }: { children: string }) {
  return <p className="text-xs leading-5 text-slate-500">{children}</p>;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Nao foi possivel entrar. Confira seu e-mail e senha e tente novamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <PremiumCard className="mx-auto max-w-md">
      <StatusBadge tone="brand">Acesso ao painel</StatusBadge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Entrar na sua conta</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Acesse seu painel para acompanhar conversas, configuracoes e status operacional da empresa.</p>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@empresa.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" placeholder="Digite sua senha" required />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar no painel"}
        </Button>
      </form>
    </PremiumCard>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const response = await fetch("/api/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        businessName: formData.get("businessName"),
        niche: formData.get("niche")
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Nao foi possivel criar sua conta agora. Tente novamente em instantes.");
      return;
    }

    await signIn("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      redirect: false
    });

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <PremiumCard>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <StatusBadge tone="brand">Conta comercial</StatusBadge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Crie sua conta</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Comece com uma estrutura pronta para responder clientes, organizar o atendimento e vender melhor no WhatsApp.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-700" />
            Experiencia premium
          </div>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-violet-700" />
            Feito para negocios locais
          </div>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-violet-700" />
            Acesso seguro
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Seu nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
          <FieldNote>Use um e-mail valido para acessar o painel depois.</FieldNote>
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Nome da empresa</Label>
          <Input id="businessName" name="businessName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="niche">Segmento</Label>
          <Input id="niche" name="niche" placeholder="Ex.: Hamburgueria, barbearia, clinica" required />
          <FieldNote>Isso ajuda a personalizar a base do atendimento.</FieldNote>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required />
          <FieldNote>Sua conta sera criada e voce seguira direto para o onboarding.</FieldNote>
        </div>
        {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Sem setup tecnico complicado. O primeiro passo e criar a base da sua operacao.</p>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Comecar agora"}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </form>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-white/80 p-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950">
            <Mail className="h-4 w-4 text-violet-700" />
            Conta pronta para uso
          </div>
          Depois do cadastro, voce segue direto para configurar o negocio.
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white/80 p-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950">
            <Store className="h-4 w-4 text-violet-700" />
            Foco comercial
          </div>
          O painel foi pensado para demonstracao, onboarding e venda consultiva.
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white/80 p-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950">
            <LockKeyhole className="h-4 w-4 text-violet-700" />
            Estrutura segura
          </div>
          Seu acesso fica protegido e pronto para evoluir junto com a operacao.
        </div>
      </div>
    </PremiumCard>
  );
}
