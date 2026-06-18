"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Não foi possível entrar. Verifique seu e-mail e senha.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Entrar no painel</CardTitle>
        <CardDescription>Use sua conta para acessar o ZapPilot Local.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" defaultValue="admin@local.test" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" defaultValue="admin123" required />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
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
      setError("Não foi possível criar sua conta agora.");
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
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece com uma estrutura pronta para responder clientes e vender mais no WhatsApp.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do negócio</Label>
            <Input id="businessName" name="businessName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Nicho</Label>
            <Input id="niche" name="niche" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Começar agora"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
