import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Building2, LayoutDashboard, MessageCircle, Settings, ShieldCheck } from "lucide-react";

import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Visao geral", icon: LayoutDashboard },
  { href: "/assistant", label: "Atendente", icon: Bot },
  { href: "/messages", label: "Conversas", icon: MessageCircle },
  { href: "/settings/business", label: "Empresa", icon: Building2 },
  { href: "/settings/integrations", label: "Integracoes", icon: Settings },
  { href: "/admin", label: "Operacao", icon: ShieldCheck }
];

export function AppShell({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return <AsyncAppShell title={title} subtitle={subtitle}>{children}</AsyncAppShell>;
}

async function AsyncAppShell({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const session = await auth();
  const navigationItems = items.filter((item) => item.href !== "/admin" || session?.user?.role === "ADMIN");

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:px-6">
      <aside className="hidden w-80 shrink-0 rounded-[32px] border border-violet-950/10 bg-[linear-gradient(180deg,#1d1438_0%,#26174a_54%,#170f32_100%)] px-5 py-6 text-white shadow-[0_36px_90px_-46px_rgba(29,20,56,0.95)] lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/brand/logo-badge.svg" alt="ZapPilot" width={48} height={48} className="h-12 w-12 rounded-2xl" />
          <div>
            <p className="font-semibold">ZapPilot</p>
            <p className="text-xs text-violet-200/70">Atendimento profissional no WhatsApp</p>
          </div>
        </div>
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <Badge className="mb-3 bg-emerald-400/15 text-emerald-200 ring-emerald-400/20">Empresa pronta para demonstracao</Badge>
          <p className="text-sm leading-6 text-violet-100/80">
            Conduza a operacao com mais clareza: plano, prontidao e ativacao comercial ficam visiveis em um unico painel.
          </p>
        </div>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-violet-50 transition hover:border-white/10 hover:bg-white/10"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/70">Modo operacional</p>
          <p className="mt-3 text-sm leading-6 text-violet-50/85">
            A ativacao comercial continua protegida pelo status do plano. Nenhum recurso pago deve ser liberado sem assinatura ativa.
          </p>
        </div>
      </aside>
      <main className="flex-1">
        <header className="glass-panel surface-gradient premium-grid sticky top-3 z-10 mb-6 rounded-[28px] border border-white/80 p-5 shadow-[0_30px_70px_-40px_rgba(76,29,149,0.28)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">Painel da empresa</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href="/settings/integrations">
                  Ver conexoes
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 whitespace-nowrap rounded-full border border-violet-200/70 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
