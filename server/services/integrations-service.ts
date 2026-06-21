import { envFlags, getIntegrationMode, env } from "@/lib/env";
import { getPaidFeaturePolicy } from "@/server/policies/paid-feature-policy";
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
  const paidFeaturePolicy = getPaidFeaturePolicy(subscriptionStatus);

  if (paidFeaturePolicy.subscriptionStatus === "ACTIVE") {
    return {
      status: "healthy",
      label: "Ativo",
      detail: "Plano liberado para atendimento e testes em producao."
    };
  }

  if (paidFeaturePolicy.subscriptionStatus === "EXPIRED") {
    return {
      status: "blocked",
      label: "Expirado",
      detail: paidFeaturePolicy.userMessageDetail
    };
  }

  if (paidFeaturePolicy.subscriptionStatus === "CANCELED") {
    return {
      status: "blocked",
      label: "Cancelado",
      detail: paidFeaturePolicy.userMessageDetail
    };
  }

  return {
    status: "blocked",
    label: "Pendente",
    detail: paidFeaturePolicy.userMessageDetail
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
      label: "Ativo",
      detail: "Canal WhatsApp ativo com credenciais preenchidas para a empresa."
    };
  }

  if (config?.isActive && hasCredentials) {
    return {
      status: "blocked",
      label: "Simulado no ambiente",
      detail: "A empresa salvou credenciais, mas o envio real ainda depende das credenciais globais do ambiente."
    };
  }

  return {
    status: "blocked",
    label: "Pendente",
    detail: "WhatsApp ainda nao esta ativo ou faltam credenciais operacionais da empresa."
  };
}

function buildAiDiagnostic(runtime: DiagnosticRuntime): DiagnosticItem {
  if (runtime.geminiLive && !runtime.geminiFailureMode) {
    return {
      status: "healthy",
      label: "Ativa",
      detail: "A IA esta respondendo normalmente."
    };
  }

  if (runtime.humanFallbackAvailable) {
    return {
      status: "degraded",
      label: runtime.geminiFailureMode ? "Degradada com atendimento humano" : "Atendimento humano",
      detail: "A IA pode degradar sob quota, mas a empresa continua operacional com atendimento humano."
    };
  }

  return {
    status: "blocked",
    label: "Indisponivel",
    detail: "Sem IA e sem atendimento humano de apoio. A empresa perde a capacidade de resposta assistida."
  };
}

function buildDatabaseDiagnostic(runtime: DiagnosticRuntime): DiagnosticItem {
  if (runtime.databaseConfigured) {
    return {
      status: "healthy",
      label: "Ativo",
      detail: "Banco de dados pronto para registrar conversas e configuracoes reais."
    };
  }

  return {
    status: "blocked",
    label: "Simulado",
    detail: "Banco real nao esta configurado. A empresa nao deve operar em modo comercial."
  };
}

function buildWebhookDiagnostic(config: DiagnosticWhatsAppConfig | null | undefined, runtime: DiagnosticRuntime): DiagnosticItem {
  const hasVerificationToken = hasValue(config?.verifyToken) || hasValue(env.whatsappWebhookVerifyToken);
  const webhookVerified = config?.webhookStatus === "verified" || config?.webhookStatus === "live";

  if (runtime.webhookVerificationOperational && (hasVerificationToken || webhookVerified)) {
    return {
      status: "healthy",
      label: "Verificado",
      detail: "A conexao do WhatsApp responde corretamente para o fluxo atual."
    };
  }

  if (runtime.webhookVerificationOperational) {
    return {
      status: "degraded",
      label: "Operacional",
      detail: "A conexao responde, mas a empresa ainda precisa alinhar token ou status final de verificacao."
    };
  }

  return {
    status: "blocked",
    label: "Bloqueado",
    detail: "A conexao do WhatsApp ainda nao esta validada para uso operacional."
  };
}

function buildReplyReadiness(summary: Omit<TenantDiagnosticSummary, "readiness">): ReplyReadiness {
  if (summary.plan.status === "blocked") {
    return {
      status: "blocked",
      reason: "Conta criada, mas o plano ainda nao esta ativo para liberar a automacao real."
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
      reason: "A conexao do WhatsApp ainda nao esta validada para receber eventos."
    };
  }

  if (summary.ai.status === "blocked") {
    return {
      status: "blocked",
      reason: "A camada de resposta esta indisponivel e sem atendimento humano de apoio."
    };
  }

  return {
      status: "ready",
      reason:
        summary.ai.status === "degraded"
          ? "Empresa pronta para responder com apoio humano enquanto a IA estiver degradada."
          : "Empresa pronta para responder em operacao."
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
        ? "Banco de dados pronto para registrar operacao real."
        : "Sem banco configurado. O produto usa modo simulado para demonstracoes e validacao local.",
      nextStep: envFlags.databaseConfigured
        ? "Seguir com operacao normal."
        : "Adicionar a DATABASE_URL para persistencia real."
    },
    {
      name: "Acesso seguro",
      configured: envFlags.authConfigured,
      mode: getIntegrationMode(envFlags.authConfigured),
      description: envFlags.authConfigured
        ? "Protecao de acesso configurada para uso real."
        : "Sem segredo de autenticacao configurado. O produto usa fallback local para desenvolvimento.",
      nextStep: envFlags.authConfigured
        ? "Conferir URL final do ambiente publicado."
        : "Gerar um AUTH_SECRET seguro antes da publicacao em producao."
    },
    {
      name: "IA de atendimento",
      configured: envFlags.geminiLive,
      mode: getIntegrationMode(envFlags.geminiLive),
      description: envFlags.geminiLive
        ? "Respostas inteligentes em operacao real."
        : "IA em modo simulado para permitir testes sem custo nem chave real.",
      nextStep: envFlags.geminiLive
        ? "Validar respostas com a empresa real."
        : "Adicionar GEMINI_API_KEY para ativar respostas reais."
    },
    {
      name: "Conexao WhatsApp",
      configured: envFlags.whatsappLive,
      mode: getIntegrationMode(envFlags.whatsappLive),
      description: envFlags.whatsappLive
        ? "Canal pronto para envio real."
        : "Fluxo local simulado para testar conexao e respostas sem Meta.",
      nextStep: envFlags.whatsappLive
        ? "Publicar a URL da conexao na Meta."
        : "Preencher token, codigo do numero e codigo da conta comercial."
    }
  ];
}
