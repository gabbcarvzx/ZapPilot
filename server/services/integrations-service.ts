import { envFlags, getIntegrationMode, env } from "@/lib/env";
import { IntegrationStatus } from "@/types/integrations";

type SubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED" | null | undefined;

interface DiagnosticWhatsAppConfig {
  accessToken?: string | null;
  metaBusinessAccountId?: string | null;
  metaPhoneNumberId?: string | null;
  verifyToken?: string | null;
  webhookStatus?: string | null;
  isActive?: boolean | null;
}

interface DiagnosticRuntime {
  databaseConfigured: boolean;
  geminiLive: boolean;
  geminiFailureMode: boolean;
  humanFallbackAvailable: boolean;
  webhookVerificationOperational: boolean;
}

interface DiagnosticItem {
  status: "healthy" | "degraded" | "blocked";
  label: string;
  detail: string;
}

interface ReplyReadiness {
  status: "ready" | "blocked";
  reason: string;
}

export interface TenantDiagnosticSummary {
  readiness: ReplyReadiness;
  plan: DiagnosticItem;
  whatsapp: DiagnosticItem;
  ai: DiagnosticItem;
  database: DiagnosticItem;
  webhook: DiagnosticItem;
}

interface TenantDiagnosticInput {
  subscriptionStatus?: SubscriptionStatus;
  whatsappConfig?: DiagnosticWhatsAppConfig | null;
  runtime?: Partial<DiagnosticRuntime>;
}

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function resolveRuntime(runtime?: Partial<DiagnosticRuntime>): DiagnosticRuntime {
  return {
    databaseConfigured: runtime?.databaseConfigured ?? envFlags.databaseConfigured,
    geminiLive: runtime?.geminiLive ?? envFlags.geminiLive,
    geminiFailureMode: runtime?.geminiFailureMode ?? false,
    humanFallbackAvailable: runtime?.humanFallbackAvailable ?? false,
    webhookVerificationOperational:
      runtime?.webhookVerificationOperational ??
      (hasValue(env.whatsappWebhookVerifyToken) || !envFlags.whatsappLive)
  };
}

function buildPlanDiagnostic(subscriptionStatus: SubscriptionStatus): DiagnosticItem {
  if (subscriptionStatus === "ACTIVE") {
    return {
      status: "healthy",
      label: "Ativo",
      detail: "Plano liberado para atendimento e testes em producao."
    };
  }

  return {
    status: "blocked",
    label: subscriptionStatus ?? "PENDING",
    detail: "Plano ainda nao foi ativado. A automacao fica bloqueada para este tenant."
  };
}

function buildWhatsAppDiagnostic(config?: DiagnosticWhatsAppConfig | null): DiagnosticItem {
  const hasCredentials =
    hasValue(config?.accessToken) &&
    hasValue(config?.metaBusinessAccountId) &&
    hasValue(config?.metaPhoneNumberId);

  if (config?.isActive && hasCredentials && envFlags.whatsappLive) {
    return {
      status: "healthy",
      label: "Live",
      detail: "Canal WhatsApp ativo com credenciais preenchidas para o tenant."
    };
  }

  if (config?.isActive && hasCredentials) {
    return {
      status: "blocked",
      label: "Mock global",
      detail: "O tenant salvou credenciais, mas o envio real ainda depende das credenciais globais do ambiente."
    };
  }

  return {
    status: "blocked",
    label: "Pendente",
    detail: "WhatsApp ainda nao esta ativo ou faltam credenciais operacionais do tenant."
  };
}

function buildAiDiagnostic(runtime: DiagnosticRuntime): DiagnosticItem {
  if (runtime.geminiLive && !runtime.geminiFailureMode) {
    return {
      status: "healthy",
      label: "Live",
      detail: "Gemini esta respondendo normalmente."
    };
  }

  if (runtime.humanFallbackAvailable) {
    return {
      status: "degraded",
      label: runtime.geminiFailureMode ? "Degradado com fallback humano" : "Fallback humano",
      detail: "A IA pode degradar sob quota, mas o tenant continua operacional com fallback humano."
    };
  }

  return {
    status: "blocked",
    label: "Indisponivel",
    detail: "Sem Gemini e sem fallback humano. O tenant perde a capacidade de resposta assistida."
  };
}

function buildDatabaseDiagnostic(runtime: DiagnosticRuntime): DiagnosticItem {
  if (runtime.databaseConfigured) {
    return {
      status: "healthy",
      label: "Live",
      detail: "Neon e Prisma estao disponiveis para persistencia real."
    };
  }

  return {
    status: "blocked",
    label: "Mock",
    detail: "Banco real nao esta configurado. O tenant nao deve operar em modo comercial."
  };
}

function buildWebhookDiagnostic(config: DiagnosticWhatsAppConfig | null | undefined, runtime: DiagnosticRuntime): DiagnosticItem {
  const hasVerificationToken = hasValue(config?.verifyToken) || hasValue(env.whatsappWebhookVerifyToken);
  const webhookVerified = config?.webhookStatus === "verified" || config?.webhookStatus === "live";

  if (runtime.webhookVerificationOperational && (hasVerificationToken || webhookVerified)) {
    return {
      status: "healthy",
      label: "Verificado",
      detail: "Webhook de verificacao responde corretamente para o fluxo atual."
    };
  }

  if (runtime.webhookVerificationOperational) {
    return {
      status: "degraded",
      label: "Operacional",
      detail: "Webhook responde, mas o tenant ainda precisa alinhar token ou status final de verificacao."
    };
  }

  return {
    status: "blocked",
    label: "Bloqueado",
    detail: "Webhook ainda nao esta validado para uso operacional."
  };
}

function buildReplyReadiness(summary: Omit<TenantDiagnosticSummary, "readiness">): ReplyReadiness {
  if (summary.plan.status === "blocked") {
    return {
      status: "blocked",
      reason: "O plano do tenant ainda nao esta ativo."
    };
  }

  if (summary.whatsapp.status === "blocked") {
    return {
      status: "blocked",
      reason: "O canal WhatsApp ainda nao esta pronto para operacao."
    };
  }

  if (summary.database.status === "blocked") {
    return {
      status: "blocked",
      reason: "O banco de dados real ainda nao esta disponivel."
    };
  }

  if (summary.webhook.status === "blocked") {
    return {
      status: "blocked",
      reason: "O webhook do WhatsApp ainda nao esta validado para receber eventos."
    };
  }

  if (summary.ai.status === "blocked") {
    return {
      status: "blocked",
      reason: "A camada de resposta esta indisponivel e sem fallback humano."
    };
  }

  return {
    status: "ready",
    reason:
      summary.ai.status === "degraded"
        ? "Tenant pronto para responder com fallback humano enquanto a IA estiver degradada."
        : "Tenant pronto para responder em operacao."
  };
}

export function getTenantDiagnosticSummary(input: TenantDiagnosticInput): TenantDiagnosticSummary {
  const runtime = resolveRuntime(input.runtime);

  const summaryWithoutReadiness = {
    plan: buildPlanDiagnostic(input.subscriptionStatus),
    whatsapp: buildWhatsAppDiagnostic(input.whatsappConfig),
    ai: buildAiDiagnostic(runtime),
    database: buildDatabaseDiagnostic(runtime),
    webhook: buildWebhookDiagnostic(input.whatsappConfig, runtime)
  };

  return {
    ...summaryWithoutReadiness,
    readiness: buildReplyReadiness(summaryWithoutReadiness)
  };
}

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
        ? "Rodar migracao e seed quando quiser persistencia real."
        : "Adicione a DATABASE_URL do Neon para persistencia real."
    },
    {
      name: "Autenticacao",
      configured: envFlags.authConfigured,
      mode: getIntegrationMode(envFlags.authConfigured),
      description: envFlags.authConfigured
        ? "Auth.js esta com secret configurado."
        : "Sem AUTH_SECRET. O projeto gera fallback local para desenvolvimento.",
      nextStep: envFlags.authConfigured
        ? "Ajustar URL final no deploy."
        : "Gerar um AUTH_SECRET seguro antes da publicacao em producao."
    },
    {
      name: "Gemini",
      configured: envFlags.geminiLive,
      mode: getIntegrationMode(envFlags.geminiLive),
      description: envFlags.geminiLive
        ? "Respostas inteligentes em modo live."
        : "IA em modo mock para permitir testes sem custo nem chave real.",
      nextStep: envFlags.geminiLive
        ? "Validar prompts com o negocio real."
        : "Adicionar GEMINI_API_KEY para ativar respostas reais."
    },
    {
      name: "WhatsApp Cloud API",
      configured: envFlags.whatsappLive,
      mode: getIntegrationMode(envFlags.whatsappLive),
      description: envFlags.whatsappLive
        ? "Integracao pronta para envio real."
        : "Fluxo local simulado para testar webhook e respostas sem Meta.",
      nextStep: envFlags.whatsappLive
        ? "Publicar URL do webhook na Meta."
        : "Preencher token, phone number ID e business account ID."
    }
  ];
}
