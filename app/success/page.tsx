import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Pagamento</p>
      <h1 className="mt-4 text-4xl font-semibold">Pagamento registrado com sucesso</h1>
      <p className="mt-4 text-slate-600">
        Nesta versão, a ativação do plano ainda pode ser feita manualmente pelo admin. Você já pode seguir para o painel e concluir a configuração.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Ir para o dashboard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/pricing">Ver planos</Link>
        </Button>
      </div>
    </main>
  );
}
