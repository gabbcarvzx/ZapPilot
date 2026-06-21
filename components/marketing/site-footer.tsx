import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-20 max-w-7xl px-4 pb-10 lg:px-6">
      <div className="glass-panel surface-gradient rounded-[32px] border border-white/80 px-6 py-8 shadow-[0_24px_60px_-38px_rgba(76,29,149,0.28)]">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-badge.svg" alt="ZapPilot" width={40} height={40} className="h-10 w-10 rounded-2xl" />
            <div>
              <p className="font-semibold text-slate-950">ZapPilot</p>
              <p className="text-sm text-slate-500">Atendimento no WhatsApp com mais velocidade, clareza e conversao.</p>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 md:text-right">
            <p>Pagamento seguro, configuracao assistida e operacao pronta para vender melhor.</p>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link href="/pricing">Planos</Link>
              <Link href="/privacy">Privacidade</Link>
              <Link href="/terms">Termos</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
