"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    setSaved("Configurações salvas.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do negócio</CardTitle>
        <CardDescription>Defina o contexto que será usado pela automação e pela IA.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do negócio</Label>
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
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={initialValues.address} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="businessHours">Horário de funcionamento</Label>
            <Input id="businessHours" name="businessHours" defaultValue={initialValues.businessHours} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tone">Tom de atendimento</Label>
            <Input id="tone" name="tone" defaultValue={initialValues.tone} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="welcomeMessage">Mensagem de boas-vindas</Label>
            <Textarea id="welcomeMessage" name="welcomeMessage" defaultValue={initialValues.welcomeMessage} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="closedMessage">Mensagem fora do horário</Label>
            <Textarea id="closedMessage" name="closedMessage" defaultValue={initialValues.closedMessage} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Salvar negócio</Button>
            {saved ? <p className="text-sm text-emerald-600">{saved}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
