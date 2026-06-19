import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlockedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Atendimento automatico temporariamente bloqueado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>
            Seu plano esta pendente, cancelado ou expirado. O painel continua acessivel, mas a empresa nao vai responder automaticamente no WhatsApp ate a reativacao.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/pricing">Ver planos</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Voltar ao painel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
