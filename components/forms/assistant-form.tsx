"use client";

import { useState } from "react";
import { BookOpenText, CircleHelp, PackageSearch, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { FormFeedback, type FormFeedbackState } from "@/components/ui/form-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { requestJson } from "@/lib/client-request";

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
  const [assistantFeedback, setAssistantFeedback] = useState<FormFeedbackState | null>(null);
  const [catalogFeedback, setCatalogFeedback] = useState<FormFeedbackState | null>(null);
  const [assistantSubmitting, setAssistantSubmitting] = useState(false);
  const [catalogSubmitting, setCatalogSubmitting] = useState(false);

  async function saveProducts(formData: FormData) {
    setCatalogSubmitting(true);
    setCatalogFeedback(null);
    const items = [
      {
        name: String(formData.get("productName") || ""),
        description: String(formData.get("productDescription") || ""),
        price: String(formData.get("productPrice") || ""),
        sortOrder: 0
      }
    ];

    try {
      await requestJson(
        "/api/products",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items)
        },
        "Nao foi possivel salvar o catalogo principal."
      );

      setCatalogFeedback({
        tone: "success",
        title: "Catalogo salvo",
        message: "Agora teste esse item no simulador para validar resposta, preco e clareza comercial."
      });
    } catch (error) {
      setCatalogFeedback({
        tone: "danger",
        title: "Falha ao salvar",
        message: error instanceof Error ? error.message : "Nao foi possivel salvar o catalogo principal."
      });
    } finally {
      setCatalogSubmitting(false);
    }
  }

  async function saveFaqs(formData: FormData) {
    setAssistantSubmitting(true);
    setAssistantFeedback(null);
    const items = [
      {
        question: String(formData.get("faqQuestion") || ""),
        answer: String(formData.get("faqAnswer") || ""),
        sortOrder: 0
      }
    ];

    try {
      await requestJson(
        "/api/faqs",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items)
        },
        "Nao foi possivel salvar a FAQ inicial."
      );

      await requestJson(
        "/api/business",
        {
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
        },
        "Nao foi possivel salvar a configuracao do atendente."
      );

      setAssistantFeedback({
        tone: "success",
        title: "Atendente salvo",
        message: "O proximo passo e revisar se a FAQ e a mensagem fora do horario refletem o atendimento real da empresa."
      });
    } catch (error) {
      setAssistantFeedback({
        tone: "danger",
        title: "Falha ao salvar",
        message: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao do atendente."
      });
    } finally {
      setAssistantSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <PremiumCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <StatusBadge tone="brand">Atendente comercial</StatusBadge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Configurar atendente</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Defina o tom, as mensagens base e uma FAQ inicial para vender com mais clareza.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-700" />
              Tom e boas-vindas
            </div>
            <div className="flex items-center gap-2">
              <CircleHelp className="h-4 w-4 text-violet-700" />
              FAQ inicial
            </div>
            <div className="flex items-center gap-2">
              <BookOpenText className="h-4 w-4 text-violet-700" />
              Resposta alinhada ao negocio
            </div>
          </div>
        </div>
        <div className="mt-6">
          <FormFeedback state={assistantFeedback} />
          <form action={saveFaqs} className="space-y-4">
            <div className="space-y-2">
              <Tooltip
                htmlFor="tone"
                label="Tom de atendimento"
                content="Descreva o estilo ideal do atendente para essa empresa: objetivo, acolhedor, premium ou mais agressivo em conversao."
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
                description="Comece pela pergunta mais comum do cliente. Isso acelera demos e melhora a primeira resposta automatica."
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
            <Button type="submit" className="w-full sm:w-auto" disabled={assistantSubmitting}>
              {assistantSubmitting ? "Salvando..." : "Salvar atendente"}
            </Button>
          </form>
        </div>
      </PremiumCard>
      <PremiumCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge tone="brand">Oferta principal</StatusBadge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Catalogo principal</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Comece com pelo menos um produto ou servico principal.</p>
          </div>
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
            <PackageSearch className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-6">
          <FormFeedback state={catalogFeedback} />
          <form action={saveProducts} className="space-y-4">
            {products.length === 0 ? (
              <EmptyState
                title="Nenhum produto ou servico cadastrado"
                description="Adicione o item principal que voce quer vender na demonstracao. Ele costuma ser a primeira pergunta em uma conversa comercial."
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
            <Button type="submit" className="w-full sm:w-auto" disabled={catalogSubmitting}>
              {catalogSubmitting ? "Salvando..." : "Salvar catalogo"}
            </Button>
          </form>
        </div>
      </PremiumCard>
    </div>
  );
}
