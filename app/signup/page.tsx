import { SignUpForm } from "@/components/forms/auth-form";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
        <div className="space-y-6">
          <StatusBadge tone="brand">Criacao de conta</StatusBadge>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Comece com uma estrutura mais profissional para atender e vender pelo WhatsApp.</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Crie sua conta, organize a empresa e avance para um painel pensado para conversao, clareza comercial e crescimento.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PremiumCard className="space-y-2">
              <p className="text-sm font-semibold text-slate-950">Configuracao assistida</p>
              <p className="text-sm leading-6 text-slate-600">Organize empresa, tom e operacao sem precisar montar tudo do zero.</p>
            </PremiumCard>
            <PremiumCard className="space-y-2">
              <p className="text-sm font-semibold text-slate-950">Visual de SaaS real</p>
              <p className="text-sm leading-6 text-slate-600">Seu painel fica pronto para demo, onboarding e venda consultiva.</p>
            </PremiumCard>
            <PremiumCard className="space-y-2">
              <p className="text-sm font-semibold text-slate-950">Evolucao segura</p>
              <p className="text-sm leading-6 text-slate-600">Ative o canal real no momento certo, sem perder controle operacional.</p>
            </PremiumCard>
          </div>
        </div>

        <SignUpForm />
      </div>
    </main>
  );
}
