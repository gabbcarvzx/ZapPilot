import type { ReactNode } from "react";
import Link from "next/link";
import { Bot, LayoutDashboard, MessageCircle, Settings, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assistant", label: "Atendente", icon: Bot },
  { href: "/messages", label: "Mensagens", icon: MessageCircle },
  { href: "/settings/business", label: "Configurações", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
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
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-72 shrink-0 rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/20 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-teal-400 to-orange-400 p-3 text-slate-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">ZapPilot Local</p>
            <p className="text-xs text-slate-400">Atendimento automático para vender mais</p>
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
          <Badge className="mb-3 bg-emerald-400/15 text-emerald-300">MVP pronto para venda</Badge>
          <p className="text-sm text-slate-200">Use o modo mock para validar onboarding, atendimento e painéis mesmo sem chaves externas.</p>
        </div>
      </aside>
      <main className="flex-1">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-900/5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Painel do cliente</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link href="/settings/integrations">Ver integrações</Link>
            </Button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
