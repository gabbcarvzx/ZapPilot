import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/logo-badge.svg" alt="ZapPilot" width={42} height={42} className="h-10 w-10 rounded-2xl" />
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">ZapPilot</p>
            <p className="text-xs font-medium text-slate-500">Atendente automático para WhatsApp</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          <Link href="/pricing">Planos</Link>
          <Link href="/privacy">Privacidade</Link>
          <Link href="/terms">Termos</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/signup">Quero começar agora</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
