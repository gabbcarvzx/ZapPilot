import { envFlags, getIntegrationMode } from "@/lib/env";
import { IntegrationStatus } from "@/types/integrations";

export function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    {
      name: "Banco de dados",
      configured: envFlags.databaseConfigured,
      mode: getIntegrationMode(envFlags.databaseConfigured),
      description: envFlags.databaseConfigured
        ? "Prisma pronto para usar Neon PostgreSQL."
        : "Sem DATABASE_URL. O app usa modo simulado para evitar quebra durante o desenvolvimento.",
      nextStep: envFlags.databaseConfigured
        ? "Rodar migração e seed quando quiser persistência real."
        : "Adicione a DATABASE_URL do Neon para persistência real."
    },
    {
      name: "Autenticação",
      configured: envFlags.authConfigured,
      mode: getIntegrationMode(envFlags.authConfigured),
      description: envFlags.authConfigured
        ? "Auth.js está com secret configurado."
        : "Sem AUTH_SECRET. O projeto gera fallback local para desenvolvimento.",
      nextStep: envFlags.authConfigured
        ? "Ajustar URL final no deploy."
        : "Gerar um AUTH_SECRET seguro antes da publicação em produção."
    },
    {
      name: "Gemini",
      configured: envFlags.geminiLive,
      mode: getIntegrationMode(envFlags.geminiLive),
      description: envFlags.geminiLive
        ? "Respostas inteligentes em modo live."
        : "IA em modo mock para permitir testes sem custo nem chave real.",
      nextStep: envFlags.geminiLive
        ? "Validar prompts com o negócio real."
        : "Adicionar GEMINI_API_KEY para ativar respostas reais."
    },
    {
      name: "WhatsApp Cloud API",
      configured: envFlags.whatsappLive,
      mode: getIntegrationMode(envFlags.whatsappLive),
      description: envFlags.whatsappLive
        ? "Integração pronta para envio real."
        : "Fluxo local simulado para testar webhook e respostas sem Meta.",
      nextStep: envFlags.whatsappLive
        ? "Publicar URL do webhook na Meta."
        : "Preencher token, phone number ID e business account ID."
    }
  ];
}
