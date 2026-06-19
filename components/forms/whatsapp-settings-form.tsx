"use client";

import { useState } from "react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

export function WhatsAppSettingsForm({
  initialValues
}: {
  initialValues: {
    metaBusinessAccountId: string;
    metaPhoneNumberId: string;
    metaAppId: string;
    verifyToken: string;
    accessToken: string;
    isActive: boolean;
  };
}) {
  const [saved, setSaved] = useState("");

  async function handleSubmit(formData: FormData) {
    setSaved("");
    await fetch("/api/business", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metaBusinessAccountId: formData.get("metaBusinessAccountId"),
        metaPhoneNumberId: formData.get("metaPhoneNumberId"),
        metaAppId: formData.get("metaAppId"),
        verifyToken: formData.get("verifyToken"),
        accessToken: formData.get("accessToken"),
        isActive: Boolean(formData.get("isActive"))
      })
    });
    setSaved("Conexao salva. O proximo passo e conferir os codigos da Meta e decidir quando a empresa sai do modo simulado.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexao do WhatsApp</CardTitle>
        <CardDescription>Voce pode salvar os dados agora e ativar o canal real quando o numero comercial estiver pronto.</CardDescription>
      </CardHeader>
      <CardContent>
        {saved ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {saved}
          </div>
        ) : null}
        {!initialValues.isActive ? (
          <div className="mb-4">
            <EmptyState
              title="Nenhum WhatsApp conectado ainda"
              description="Voce pode salvar os campos agora para a call comercial e ativar a integracao real quando o numero da Meta estiver pronto."
              actionLabel="Simulado agora, ativacao real depois"
            />
          </div>
        ) : null}
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Tooltip
              htmlFor="metaBusinessAccountId"
              label="Codigo da conta comercial"
              content="Identifica a conta comercial da Meta ligada a empresa e deve bater com o ambiente que sera ativado."
            />
            <Input id="metaBusinessAccountId" name="metaBusinessAccountId" defaultValue={initialValues.metaBusinessAccountId} />
          </div>
          <div className="space-y-2">
            <Tooltip
              htmlFor="metaPhoneNumberId"
              label="Codigo do numero"
              content="Esse codigo identifica o numero conectado na Cloud API. Sem ele, o envio real nao sai do ambiente simulado."
            />
            <Input id="metaPhoneNumberId" name="metaPhoneNumberId" defaultValue={initialValues.metaPhoneNumberId} />
          </div>
          <div className="space-y-2">
            <Tooltip
              htmlFor="metaAppId"
              label="Codigo do app"
              content="Use o codigo do projeto Meta que hospedara a conexao do WhatsApp e o envio real dessa empresa."
            />
            <Input id="metaAppId" name="metaAppId" defaultValue={initialValues.metaAppId} />
          </div>
          <div className="space-y-2">
            <Tooltip
              htmlFor="verifyToken"
              label="Token de verificacao"
              content="Use exatamente o mesmo token configurado na Meta para validar a conexao do WhatsApp."
            />
            <Input id="verifyToken" name="verifyToken" defaultValue={initialValues.verifyToken} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Tooltip
              htmlFor="accessToken"
              label="Token de acesso"
              content="Esse token autoriza o envio real. Enquanto estiver vazio, o produto continua em modo simulado para demos."
            />
            <Input id="accessToken" name="accessToken" defaultValue={initialValues.accessToken} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked={initialValues.isActive} />
            Marcar conexao como ativa
          </label>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Salvar conexao</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
