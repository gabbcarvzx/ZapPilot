"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MessageSimulatorForm({ businessId }: { businessId: string }) {
  const [response, setResponse] = useState("");

  async function handleSubmit(formData: FormData) {
    const res = await fetch("/api/dev/simulate-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId,
        phone: formData.get("phone"),
        content: formData.get("content"),
        contactName: formData.get("contactName")
      })
    });

    const data = await res.json();
    setResponse(data.reply ?? "Sem resposta");
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5">
      <div className="space-y-2">
        <Label htmlFor="contactName">Nome do contato</Label>
        <Input id="contactName" name="contactName" defaultValue="Lead do tráfego pago" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue="5511999990000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Mensagem recebida</Label>
        <Textarea id="content" name="content" defaultValue="Qual o preço do principal combo?" />
      </div>
      <Button type="submit">Simular atendimento</Button>
      {response ? <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">{response}</div> : null}
    </form>
  );
}
