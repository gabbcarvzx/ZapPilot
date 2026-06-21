"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { FormFeedback, type FormFeedbackState } from "@/components/ui/form-feedback";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip } from "@/components/ui/tooltip";
import { requestJson } from "@/lib/client-request";

export function WhatsAppSettingsForm({
  initialValues,
  canActivateReal = true,
  activationBlockedReason = ""
}: {
  initialValues: {
    metaBusinessAccountId: string;
    metaPhoneNumberId: string;
    metaAppId: string;
    verifyToken: string;
    accessToken: string;
    isActive: boolean;
  };
  canActivateReal?: boolean;
  activationBlockedReason?: string;
}) {
  const [feedback, setFeedback] = useState<FormFeedbackState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setFeedback(null);

    try {
      await requestJson(
        "/api/business",
        {
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
        },
        "Nao foi possivel salvar a configuracao do WhatsApp."
      );

      setFeedback({
        tone: "success",
        title: "Conexao salva",
        message: "O proximo passo e conferir os codigos da Meta e decidir quando a empresa sai do modo simulado."
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        title: "Falha ao salvar",
        message: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao do WhatsApp."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PremiumCard>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <StatusBadge tone={initialValues.isActive ? "success" : "warning"}>
            {initialValues.isActive ? "Canal pronto para operacao" : "Canal em configuracao"}
          </StatusBadge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Conexao do WhatsApp</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Voce pode salvar os dados agora e ativar o canal real quando o numero comercial estiver pronto.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-700" />
            Credenciais seguras
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-violet-700" />
            Pronto para Meta
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-violet-700" />
            Ativacao sob controle
          </div>
        </div>
      </div>
      <div className="mt-6">
        <FormFeedback state={feedback} />
        {!canActivateReal ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {activationBlockedReason || "A ativacao real do WhatsApp fica bloqueada ate a confirmacao do pagamento."}
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
        <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2 sm:col-span-2">
            <Tooltip
              htmlFor="accessToken"
              label="Token de acesso"
              content="Esse token autoriza o envio real. Enquanto estiver vazio, o produto continua em modo simulado para demos."
            />
            <Input id="accessToken" name="accessToken" defaultValue={initialValues.accessToken} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initialValues.isActive}
              disabled={!canActivateReal}
              className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-200"
            />
            Marcar conexao como ativa
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar conexao"}
            </Button>
          </div>
        </form>
      </div>
    </PremiumCard>
  );
}
