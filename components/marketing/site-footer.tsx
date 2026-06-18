import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-7xl border-t border-slate-200/80 px-4 py-8 text-sm text-slate-500 lg:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>ZapPilot Local. Atendimento automático para WhatsApp focado em pequenos negócios.</p>
        <div className="flex gap-4">
          <Link href="/privacy">Privacidade</Link>
          <Link href="/terms">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
