export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Aviso: estes termos são provisórios e devem ser revisados antes da publicação comercial final.
      </div>
      <h1 className="mt-6 text-4xl font-semibold">Termos de Uso</h1>
      <div className="mt-6 space-y-4 text-slate-600">
        <p>O uso do ZapPilot Local deve seguir as políticas da Meta, boas práticas de atendimento e legislação aplicável ao negócio contratante.</p>
        <p>O cliente é responsável por revisar mensagens automáticas, dados fornecidos ao sistema e conformidade do seu uso comercial.</p>
        <p>Antes do lançamento, este documento deve ser substituído por uma versão revisada com cláusulas comerciais e jurídicas definitivas.</p>
      </div>
    </main>
  );
}
