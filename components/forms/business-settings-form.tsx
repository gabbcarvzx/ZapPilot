"use client";

import { useState } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";

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
  const [saved, setSaved] = useState("");

  async function handleSubmit(formData: FormData) {
    setSaved("");
    await fetch("/api/business", {
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
    });
    setSaved("Negocio salvo. Agora valide se o horario, o tom e as mensagens representam como voce vende hoje.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracao do negocio</CardTitle>
        <CardDescription>Defina o contexto que sera usado pela automacao e pela IA.</CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {saved}
          </div>
        ) : null}
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do negocio</Label>
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereco</Label>
            <Input id="address" name="address" defaultValue={initialValues.address} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessHours">Horario de funcionamento</Label>
            <Input id="businessHours" name="businessHours" defaultValue={initialValues.businessHours} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Tooltip
              htmlFor="tone"
              label="Tom de atendimento"
              content="Descreva como o atendente deve soar nas respostas: mais direto, consultivo, premium ou popular."
            />
            <Input id="tone" name="tone" defaultValue={initialValues.tone} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
            <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={initialValues.welcomeMessage} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Tooltip
              htmlFor="closedMessage"
              label="Mensagem fora do horario"
              content="Explique o que acontece depois: quando volta a atender, se registra interesse e qual expectativa o lead deve ter."
            />
            <Textarea id="closedMessage" name="closedMessage" defaultValue={initialValues.closedMessage} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Salvar negocio</Button>
          </div>
          {!initialValues.whatsappNumber ? (
            <div className="md:col-span-2">
              <EmptyState
                title="WhatsApp comercial ainda nao informado"
                description="Preencha o numero principal do negocio para facilitar demos, handoff humano e futura ativacao na Meta."
                actionLabel="Preencha o numero usado com clientes"
              />
            </div>
          ) : null}
          {!initialValues.businessHours ? (
            <div className="md:col-span-2">
              <EmptyState
                title="Horario comercial ainda vazio"
                description="Definir o horario agora melhora a mensagem fora do expediente e evita prometer atendimento imediato na demo."
                actionLabel="Informe dias e faixa horaria"
              />
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
