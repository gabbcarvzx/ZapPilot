export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Aviso: este texto de privacidade é provisório e deve ser revisado antes da publicação comercial final.
      </div>
      <h1 className="mt-6 text-4xl font-semibold">Política de Privacidade</h1>
      <div className="mt-6 space-y-4 text-slate-600">
        <p>O ZapPilot Local coleta dados de cadastro, configuração do negócio e histórico de atendimento para operar a plataforma.</p>
        <p>Informações sensíveis devem ser armazenadas com controles de acesso, variáveis de ambiente seguras e revisão jurídica antes do lançamento oficial.</p>
        <p>Antes da publicação comercial, substitua esta página por um texto revisado conforme sua política real de retenção, processamento e compartilhamento de dados.</p>
      </div>
    </main>
  );
}
