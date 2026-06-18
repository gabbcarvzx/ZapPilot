import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ZapPilot Local
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
        <Link href="/pricing">Planos</Link>
        <Link href="/privacy">Privacidade</Link>
        <Link href="/terms">Termos</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Começar agora</Link>
        </Button>
      </div>
    </header>
  );
}
