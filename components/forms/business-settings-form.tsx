"use client";

import { useState } from "react";
import { Building2, Clock3, MessageSquareText } from "lucide-react";

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

interface BusinessSettingsFormProps {
  initialValues: {
    name: string;
    niche: string;
    address: string;
    phone: string;
    whatsappNumber: string;
    businessHours: string;
    welcomeMessage: string;
    closedMessage: string;
    tone: string;
    isOnboardingComplete?: boolean;
  };
}

export function BusinessSettingsForm({ initialValues }: BusinessSettingsFormProps) {
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setFeedback(null);

    try {
      await requestJson(
        "/api/business",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: formData.get("name"),
            niche: formData.get("niche"),
            address: formData.get("address"),
            phone: formData.get("phone"),
            whatsappNumber: formData.get("whatsappNumber"),
            businessHours: formData.get("businessHours"),
            welcomeMessage: formData.get("welcomeMessage"),
            closedMessage: formData.get("closedMessage"),
            tone: formData.get("tone"),
            isOnboardingComplete: true
          })
        },
        "Nao foi possivel salvar os dados da empresa."
      );

      setFeedback({
        tone: "success",
        title: "Empresa salva",
        message: "Agora valide se o horario, o tom e as mensagens representam como voce atende e vende hoje."
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        title: "Falha ao salvar",
        message: error instanceof Error ? error.message : "Nao foi possivel salvar os dados da empresa."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PremiumCard>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <StatusBadge tone="brand">Contexto comercial</StatusBadge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Dados da empresa</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Defina o contexto comercial que vai orientar o atendimento automatico e a demonstracao do seu negocio.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-700" />
            Dados da empresa
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-violet-700" />
            Horarios e contexto real
          </div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-violet-700" />
            Tom comercial consistente
          </div>
        </div>
      </div>
      <div className="mt-6">
        <FormFeedback state={feedback} />
        <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da empresa</Label>
            <Input id="name" name="name" defaultValue={initialValues.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Nicho</Label>
            <Input id="niche" name="niche" defaultValue={initialValues.niche} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" defaultValue={initialValues.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp</Label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={initialValues.whatsappNumber} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Endereco</Label>
            <Input id="address" name="address" defaultValue={initialValues.address} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="businessHours">Horario de funcionamento</Label>
            <Input id="businessHours" name="businessHours" defaultValue={initialValues.businessHours} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Tooltip htmlFor="tone" label="Tom de atendimento" content="Descreva como sua empresa costuma atender: mais direta, consultiva, premium ou popular." />
            <Input id="tone" name="tone" defaultValue={initialValues.tone} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
            <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={initialValues.welcomeMessage} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Tooltip
              htmlFor="closedMessage"
              label="Mensagem fora do horario"
              content="Explique o que acontece depois: quando volta a atender, se registra interesse e qual expectativa o lead deve ter."
            />
            <Textarea id="closedMessage" name="closedMessage" defaultValue={initialValues.closedMessage} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar empresa"}
            </Button>
          </div>
          {!initialValues.whatsappNumber ? (
            <div className="sm:col-span-2">
              <EmptyState
                title="WhatsApp comercial ainda nao informado"
                description="Preencha o numero principal do negocio para facilitar demos, handoff humano e futura ativacao na Meta."
                actionLabel="Preencha o numero usado com clientes"
              />
            </div>
          ) : null}
          {!initialValues.businessHours ? (
            <div className="sm:col-span-2">
              <EmptyState
                title="Horario comercial ainda vazio"
                description="Definir o horario agora melhora a mensagem fora do expediente e evita prometer atendimento imediato na demo."
                actionLabel="Informe dias e faixa horaria"
              />
            </div>
          ) : null}
        </form>
      </div>
    </PremiumCard>
  );
}
