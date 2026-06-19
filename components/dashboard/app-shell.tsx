import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { Bot, Building2, LayoutDashboard, MessageCircle, Settings, ShieldCheck } from "lucide-react";

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
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
      <aside className="hidden w-72 shrink-0 rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/20 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/brand/logo-badge.svg" alt="ZapPilot" width={48} height={48} className="h-12 w-12 rounded-2xl" />
          <div>
            <p className="font-semibold">ZapPilot</p>
            <p className="text-xs text-slate-400">Atendimento profissional no WhatsApp</p>
          </div>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-3xl bg-white/10 p-4">
          <Badge className="mb-3 bg-emerald-400/15 text-emerald-300">Empresa pronta para demonstracao</Badge>
          <p className="text-sm leading-6 text-slate-200">
            Use a versao demonstrativa para mostrar valor comercial e ative o canal real quando o WhatsApp da empresa estiver pronto.
          </p>
        </div>
      </aside>
      <main className="flex-1">
        <header className="mb-6 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-900/5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Painel da empresa</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href="/settings/integrations">Ver conexoes</Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
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
