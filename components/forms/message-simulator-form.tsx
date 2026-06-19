"use client";

import React, { useState } from "react";

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
        <p className="text-lg font-semibold text-slate-900">Simulador comercial</p>
        <p className="text-sm leading-6 text-slate-600">
          Use o <strong>modo simulado</strong> para demonstrar resposta, tom e fluxo sem depender da Meta. Quando o numero do cliente estiver pronto,
          repita o mesmo roteiro no <strong>canal real</strong> para validar a operacao.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">O que observar</p>
        <ul className="mt-2 space-y-1">
          <li>1. A mensagem recebida faz sentido para o nicho e para o pitch comercial.</li>
          <li>2. A resposta cita produto, horario, FAQ ou handoff humano quando necessario.</li>
          <li>3. No canal real, a conversa deve aparecer aqui depois do envio no WhatsApp.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">Nome do contato</Label>
        <Input id="contactName" name="contactName" defaultValue="Lead do trafego pago" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue="5511999990000" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Mensagem recebida</Label>
        <Textarea id="content" name="content" defaultValue="Qual o preco do principal combo?" />
      </div>
      <Button type="submit">Simular atendimento</Button>
      {response ? (
        <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-medium">Resposta gerada</p>
          <p className="mt-2">{response}</p>
        </div>
      ) : null}
    </form>
  );
}
