"use client";

import { useState } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";

export function AssistantForm({
  business,
  products,
  faqs
}: {
  business: {
    name: string;
    niche: string;
    address: string;
    phone: string;
    whatsappNumber: string;
    businessHours?: string;
    businessHoursJson?: string;
    tone: string;
    welcomeMessage: string;
    closedMessage: string;
  };
  products: Array<{ name: string; description: string; price: string }>;
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [assistantSaved, setAssistantSaved] = useState("");
  const [catalogSaved, setCatalogSaved] = useState("");

  async function saveProducts(formData: FormData) {
    setCatalogSaved("");
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
    setCatalogSaved("Catalogo salvo. Agora teste esse item no simulador para validar resposta, preco e clareza comercial.");
  }

  async function saveFaqs(formData: FormData) {
    setAssistantSaved("");
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
        name: business.name,
        niche: business.niche,
        address: business.address,
        phone: business.phone,
        whatsappNumber: business.whatsappNumber,
        businessHours: business.businessHoursJson ?? business.businessHours,
        tone: String(formData.get("tone") || business.tone),
        welcomeMessage: String(formData.get("welcomeMessage") || business.welcomeMessage),
        closedMessage: String(formData.get("closedMessage") || business.closedMessage),
        isOnboardingComplete: true
      })
    });

    setAssistantSaved("Atendente salvo. O proximo passo e revisar se a FAQ e a mensagem fora do horario refletem o atendimento real.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Configurar atendente</CardTitle>
          <CardDescription>Defina o tom, mensagens-base e uma FAQ inicial para a IA e para a automacao.</CardDescription>
        </CardHeader>
        <CardContent>
          {assistantSaved ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {assistantSaved}
            </div>
          ) : null}
          <form action={saveFaqs} className="space-y-4">
            <div className="space-y-2">
              <Tooltip
                htmlFor="tone"
                label="Tom de atendimento"
                content="Descreva o estilo ideal do atendente para esse negocio: objetivo, acolhedor, premium, tecnico ou agressivo em conversao."
              />
              <Input id="tone" name="tone" defaultValue={business.tone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
              <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={business.welcomeMessage} />
            </div>
            <div className="space-y-2">
              <Tooltip
                htmlFor="closedMessage"
                label="Mensagem quando estiver fechado"
                content="Explique quando o negocio volta, se o contato sera retomado e como manter o lead interessado sem prometer resposta imediata."
              />
              <Textarea id="closedMessage" name="closedMessage" defaultValue={business.closedMessage} />
            </div>
            {faqs.length === 0 ? (
              <EmptyState
                title="Nenhuma FAQ configurada"
                description="Comece pela pergunta mais comum do lead. Isso acelera demos e melhora a primeira resposta automatica."
                actionLabel="Cadastre ao menos uma pergunta frequente"
              />
            ) : null}
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
          <CardTitle>Catalogo basico</CardTitle>
          <CardDescription>Comece com pelo menos um produto ou servico principal.</CardDescription>
        </CardHeader>
        <CardContent>
          {catalogSaved ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {catalogSaved}
            </div>
          ) : null}
          <form action={saveProducts} className="space-y-4">
            {products.length === 0 ? (
              <EmptyState
                title="Nenhum produto ou servico cadastrado"
                description="Adicione o item principal que voce quer vender na call. Ele costuma ser a primeira pergunta em uma demo comercial."
                actionLabel="Cadastre o item principal do pitch"
              />
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="productName">Nome</Label>
              <Input id="productName" name="productName" defaultValue={products[0]?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Descricao</Label>
              <Textarea id="productDescription" name="productDescription" defaultValue={products[0]?.description ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Preco</Label>
              <Input id="productPrice" name="productPrice" defaultValue={products[0]?.price ?? ""} />
            </div>
            <Button type="submit">Salvar catalogo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
