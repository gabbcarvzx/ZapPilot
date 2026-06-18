"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AssistantForm({
  business,
  products,
  faqs
}: {
  business: {
    tone: string;
    welcomeMessage: string;
    closedMessage: string;
  };
  products: Array<{ name: string; description: string; price: string }>;
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [saved, setSaved] = useState("");

  async function saveProducts(formData: FormData) {
    const items = [
      {
        name: String(formData.get("productName") || ""),
        description: String(formData.get("productDescription") || ""),
        price: String(formData.get("productPrice") || ""),
        sortOrder: 0
      }
    ];

    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items)
    });
    setSaved("Atendente e catálogo atualizados.");
  }

  async function saveFaqs(formData: FormData) {
    const items = [
      {
        question: String(formData.get("faqQuestion") || ""),
        answer: String(formData.get("faqAnswer") || ""),
        sortOrder: 0
      }
    ];

    await fetch("/api/faqs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items)
    });

    await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("businessName") || "ZapPilot Local"),
        niche: String(formData.get("niche") || "Comércio local"),
        address: String(formData.get("address") || ""),
        phone: String(formData.get("phone") || ""),
        whatsappNumber: String(formData.get("whatsappNumber") || ""),
        businessHours: String(formData.get("businessHours") || ""),
        tone: String(formData.get("tone") || business.tone),
        welcomeMessage: String(formData.get("welcomeMessage") || business.welcomeMessage),
        closedMessage: String(formData.get("closedMessage") || business.closedMessage),
        isOnboardingComplete: true
      })
    });

    setSaved("Atendente e FAQ atualizados.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Configurar atendente</CardTitle>
          <CardDescription>Defina o tom, mensagens-base e uma FAQ inicial para a IA e para a automação.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveFaqs} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tom de atendimento</Label>
              <Input id="tone" name="tone" defaultValue={business.tone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
              <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={business.welcomeMessage} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closedMessage">Mensagem quando estiver fechado</Label>
              <Textarea id="closedMessage" name="closedMessage" defaultValue={business.closedMessage} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqQuestion">Pergunta frequente</Label>
              <Input id="faqQuestion" name="faqQuestion" defaultValue={faqs[0]?.question ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqAnswer">Resposta da FAQ</Label>
              <Textarea id="faqAnswer" name="faqAnswer" defaultValue={faqs[0]?.answer ?? ""} />
            </div>
            <Button type="submit">Salvar atendente</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo básico</CardTitle>
          <CardDescription>Comece com pelo menos um produto ou serviço principal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveProducts} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome</Label>
              <Input id="productName" name="productName" defaultValue={products[0]?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição</Label>
              <Textarea id="productDescription" name="productDescription" defaultValue={products[0]?.description ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Preço</Label>
              <Input id="productPrice" name="productPrice" defaultValue={products[0]?.price ?? ""} />
            </div>
            <Button type="submit">Salvar catálogo</Button>
            {saved ? <p className="text-sm text-emerald-600">{saved}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
