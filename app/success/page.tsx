import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <PremiumCard className="overflow-hidden p-0">
        <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#22143d_0%,#4c1d95_52%,#6d28d9_100%)] px-8 py-8 text-white">
          <StatusBadge tone="success" className="bg-emerald-400/15 text-emerald-100 ring-emerald-300/20">
            Etapa concluida
          </StatusBadge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Recebemos sua solicitacao com sucesso</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-violet-100/85">
            Sua conta ja pode seguir para o painel enquanto a operacao valida os proximos passos de ativacao.
          </p>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Conta pronta para continuar</p>
                <p className="text-sm text-slate-600">Acesso liberado para seguir com a configuracao inicial.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-violet-100 bg-violet-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-violet-700 shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Ativacao acompanhada</p>
                <p className="text-sm text-slate-600">A operacao ainda pode exigir validacao manual antes da liberacao final.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Nesta fase, voce ja pode seguir para o painel, adiantar a configuracao da empresa e preparar a operacao para um atendimento mais profissional no WhatsApp.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">Ir para o painel</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
        </div>
      </PremiumCard>
    </main>
  );
}
