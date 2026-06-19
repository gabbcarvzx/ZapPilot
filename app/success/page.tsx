import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Plano recebido</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-950">Recebemos sua solicitacao com sucesso</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">
        Nesta fase, a liberacao do plano ainda e feita manualmente pela operacao. Voce ja pode seguir para o painel e adiantar a configuracao da sua empresa.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Ir para o painel</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/pricing">Ver planos</Link>
        </Button>
      </div>
    </main>
  );
}
