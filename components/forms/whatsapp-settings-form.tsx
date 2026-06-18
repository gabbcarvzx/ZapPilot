"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    setSaved("Configuração do WhatsApp salva.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do WhatsApp</CardTitle>
        <CardDescription>Você pode salvar dados parciais agora e ativar a automação depois.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="metaBusinessAccountId">Business Account ID</Label>
            <Input id="metaBusinessAccountId" name="metaBusinessAccountId" defaultValue={initialValues.metaBusinessAccountId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaPhoneNumberId">Phone Number ID</Label>
            <Input id="metaPhoneNumberId" name="metaPhoneNumberId" defaultValue={initialValues.metaPhoneNumberId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaAppId">App ID</Label>
            <Input id="metaAppId" name="metaAppId" defaultValue={initialValues.metaAppId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verifyToken">Verify token</Label>
            <Input id="verifyToken" name="verifyToken" defaultValue={initialValues.verifyToken} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="accessToken">Access token</Label>
            <Input id="accessToken" name="accessToken" defaultValue={initialValues.accessToken} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" name="isActive" defaultChecked={initialValues.isActive} />
            Marcar como ativo
          </label>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Salvar integração</Button>
            {saved ? <p className="text-sm text-emerald-600">{saved}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
