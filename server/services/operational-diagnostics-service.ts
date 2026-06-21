import { envFlags } from "@/lib/env";
import { logInfo } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  getTenantDiagnosticSummary,
  type TenantDiagnosticSummary
} from "@/server/services/integrations-service";
import { getAllBusinessesWithSubscriptions } from "@/server/services/subscription-service";

type DiagnosticStatus = "healthy" | "degraded" | "blocked" | "not_configured";
type DiagnosticMode = "Live" | "Mock" | "Not integrated yet";
type SubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED" | null | undefined;

interface WhatsAppDiagnosticConfig {
  accessToken?: string | null;
  metaBusinessAccountId?: string | null;
  metaPhoneNumberId?: string | null;
  verifyToken?: string | null;
  webhookStatus?: string | null;
  isActive?: boolean | null;
}

interface OperationalDiagnosticItem {
  status: DiagnosticStatus;
  mode: DiagnosticMode;
  label: string;
  detail: string;
  provider?: string;
  latencyMs?: number | null;
}

interface OperationalReadiness {
  status: "ready" | "blocked";
  reason: string;
}

export interface TenantOperationalDiagnostics {
  readiness: OperationalReadiness;
  plan: OperationalDiagnosticItem;
  whatsapp: OperationalDiagnosticItem;
  ai: OperationalDiagnosticItem;
  auth: OperationalDiagnosticItem;
  database: OperationalDiagnosticItem;
  webhook: OperationalDiagnosticItem;
  billing: OperationalDiagnosticItem;
}

export interface AdminOperationalTenantSummary {
  businessId: string;
  name: string;
  ownerEmail: string | null;
  isOnboardingComplete: boolean;
  usesMockMode: boolean;
  missingWhatsApp: boolean;
  diagnostics: TenantOperationalDiagnostics;
}

export interface AdminOperationalSummary {
  system: SystemOperationalDiagnostics;
  commercial: {
    active: number;
    pending: number;
    expired: number;
    trial: number;
    estimatedRevenueCents: number;
    planDistribution: Array<{
      planName: string;
      count: number;
    }>;
  };
  tenants: {
    total: number;
    ready: number;
    incompleteConfig: number;
    usingMock: number;
    withoutWhatsApp: number;
  };
  tenantSummaries: AdminOperationalTenantSummary[];
}

export interface SystemOperationalDiagnostics {
  app: {
    status: "healthy";
    detail: string;
  };
  database: OperationalDiagnosticItem;
  auth: OperationalDiagnosticItem;
  gemini: OperationalDiagnosticItem;
  whatsapp: OperationalDiagnosticItem;
  billing: OperationalDiagnosticItem;
  timestamp: string;
  secretsExposed: false;
}

function getBillingDiagnostic(): OperationalDiagnosticItem {
  return envFlags.billingConfigured
    ? {
        status: "healthy",
        mode: "Live",
        label: "Ativo",
        detail: "Checkout e webhook de billing prontos para operacao.",
        provider: "ASAAS"
      }
    : {
        status: "degraded",
        mode: "Mock",
        label: "Configuracao pendente",
        detail: "Billing integrado no codigo, mas ainda sem credenciais operacionais do ASAAS.",
        provider: "ASAAS"
      };
}

function getAuthDiagnostic(): OperationalDiagnosticItem {
  return envFlags.authConfigured
    ? {
        status: "healthy",
      mode: "Live",
      label: "Ativo",
      detail: "Autenticacao configurada para proteger o acesso ao painel.",
      provider: "Auth.js"
    }
  : {
      status: "degraded",
      mode: "Mock",
      label: "Fallback local",
      detail: "Ambiente sem AUTH_SECRET real. Apenas desenvolvimento local deve usar este modo.",
      provider: "Auth.js"
    };
}

function toOperationalItem(
  item: {
    status: "healthy" | "degraded" | "blocked";
    label: string;
    detail: string;
  },
  mode: DiagnosticMode
): OperationalDiagnosticItem {
  return {
    status: item.status,
    mode,
    label: item.label,
    detail: item.detail
  };
}

async function getDatabaseDiagnostic(): Promise<OperationalDiagnosticItem> {
  if (!prisma) {
    return {
      status: "blocked",
      mode: "Mock",
      label: "Simulado",
      detail: "Banco real nao configurado. Operacao em modo simulado.",
      provider: "PostgreSQL",
      latencyMs: null
    };
  }

  try {
    const startedAt = Date.now();
    if ("$queryRaw" in prisma && typeof prisma.$queryRaw === "function") {
      await prisma.$queryRaw`SELECT 1`;
    }
    const latencyMs = Date.now() - startedAt;

    return {
      status: "healthy",
      mode: "Live",
      label: "Ativo",
      detail: "Banco de dados acessivel para operacao.",
      provider: "PostgreSQL",
      latencyMs
    };
  } catch {
    return {
      status: "blocked",
      mode: "Live",
      label: "Indisponivel",
      detail: "Banco configurado, mas indisponivel no momento.",
      provider: "PostgreSQL",
      latencyMs: null
    };
  }
}

function buildSystemItem(
  configured: boolean,
  healthyLabel: string,
  mockLabel: string,
  healthyDetail: string,
  mockDetail: string,
  provider: string
): OperationalDiagnosticItem {
  return configured
    ? {
        status: "healthy",
        mode: "Live",
        label: healthyLabel,
        detail: healthyDetail,
        provider
      }
    : {
        status: "degraded",
        mode: "Mock",
        label: mockLabel,
        detail: mockDetail,
        provider
      };
}

function getModeForTenantSummary(summary: TenantDiagnosticSummary, config?: WhatsAppDiagnosticConfig | null) {
  const hasTenantCredentials = Boolean(
    config?.isActive && config?.accessToken?.trim() && config?.metaBusinessAccountId?.trim() && config?.metaPhoneNumberId?.trim()
  );

  return {
    plan: summary.plan.status === "healthy" ? "Live" : "Mock",
    whatsapp: hasTenantCredentials ? "Live" : "Mock",
    ai: envFlags.geminiLive ? "Live" : "Mock",
    database: envFlags.databaseConfigured ? "Live" : "Mock",
    webhook: hasTenantCredentials || Boolean(config?.verifyToken?.trim()) ? "Live" : "Mock"
  } satisfies Record<keyof Omit<TenantDiagnosticSummary, "readiness">, DiagnosticMode>;
}

function withProvider(item: OperationalDiagnosticItem, provider: string): OperationalDiagnosticItem {
  return {
    ...item,
    provider
  };
}

export async function getTenantOperationalDiagnostics(input: {
  subscriptionStatus?: SubscriptionStatus;
  whatsappConfig?: WhatsAppDiagnosticConfig | null;
}): Promise<TenantOperationalDiagnostics> {
  const summary = getTenantDiagnosticSummary(input);
  const modes = getModeForTenantSummary(summary, input.whatsappConfig);

  return {
    readiness: summary.readiness,
    plan: toOperationalItem(summary.plan, modes.plan),
    whatsapp: withProvider(toOperationalItem(summary.whatsapp, modes.whatsapp), "WhatsApp Cloud API"),
    ai: withProvider(toOperationalItem(summary.ai, modes.ai), "Gemini"),
    auth: getAuthDiagnostic(),
    database: toOperationalItem(summary.database, modes.database),
    webhook: withProvider(toOperationalItem(summary.webhook, modes.webhook), "Meta Webhook"),
    billing: getBillingDiagnostic()
  };
}

export async function getSystemOperationalDiagnostics(): Promise<SystemOperationalDiagnostics> {
  const diagnostics: SystemOperationalDiagnostics = {
    app: {
      status: "healthy",
      detail: "Aplicacao respondendo normalmente."
    },
    database: await getDatabaseDiagnostic(),
    auth: buildSystemItem(
      envFlags.authConfigured,
      "Ativo",
      "Fallback local",
      "Autenticacao configurada para uso real.",
      "AUTH_SECRET ausente. Ambiente opera com fallback local fora de producao.",
      "Auth.js"
    ),
    gemini: buildSystemItem(
      envFlags.geminiLive,
      "Ativo",
      "Mock",
      "Gemini configurado para respostas live.",
      "Gemini em modo mock.",
      "Gemini"
    ),
    whatsapp: buildSystemItem(
      envFlags.whatsappLive,
      "Ativo",
      "Mock",
      "WhatsApp global configurado para envio live.",
      "WhatsApp em modo mock.",
      "WhatsApp Cloud API"
    ),
    billing: getBillingDiagnostic(),
    timestamp: new Date().toISOString(),
    secretsExposed: false
  };

  logInfo("health.system_diagnostics.generated", {
    metadata: {
      databaseStatus: diagnostics.database.status,
      authStatus: diagnostics.auth.status,
      geminiStatus: diagnostics.gemini.status,
      whatsappStatus: diagnostics.whatsapp.status,
      billingStatus: diagnostics.billing.status
    }
  });

  return diagnostics;
}

export async function getAdminOperationalSummary(): Promise<AdminOperationalSummary> {
  const [system, businesses] = await Promise.all([
    getSystemOperationalDiagnostics(),
    getAllBusinessesWithSubscriptions()
  ]);

  const tenantSummaries = await Promise.all(
    businesses.map(async (business) => {
      const diagnostics = await getTenantOperationalDiagnostics({
        subscriptionStatus: business.subscriptions[0]?.status,
        whatsappConfig: business.whatsappConfig
      });
      const missingWhatsApp = !business.whatsappConfig?.isActive || !business.whatsappConfig?.metaPhoneNumberId?.trim();
      const usesMockMode = [
        diagnostics.plan.mode,
        diagnostics.whatsapp.mode,
        diagnostics.ai.mode,
        diagnostics.auth.mode,
        diagnostics.database.mode,
        diagnostics.webhook.mode
      ].includes("Mock");

      return {
        businessId: business.id,
        name: business.name,
        ownerEmail: business.owner?.email ?? null,
        isOnboardingComplete: business.isOnboardingComplete,
        usesMockMode,
        missingWhatsApp,
        diagnostics
      };
    })
  );

  const activeSubscriptions = businesses
    .map((business) => business.subscriptions[0])
    .filter((subscription) => subscription?.status === "ACTIVE");
  const pendingSubscriptions = businesses
    .map((business) => business.subscriptions[0])
    .filter((subscription) => subscription?.status === "PENDING" && subscription?.paymentStatus !== "CHECKOUT_PENDING");
  const trialSubscriptions = businesses
    .map((business) => business.subscriptions[0])
    .filter((subscription) => subscription?.status === "PENDING" && subscription?.paymentStatus === "CHECKOUT_PENDING");
  const expiredSubscriptions = businesses
    .map((business) => business.subscriptions[0])
    .filter((subscription) => subscription?.status === "EXPIRED");
  const estimatedRevenueCents = activeSubscriptions.reduce((sum, subscription) => sum + (subscription?.plan?.priceCents ?? 0), 0);
  const planDistributionMap = new Map<string, number>();

  businesses.forEach((business) => {
    const planName = business.subscriptions[0]?.plan?.name ?? "Sem plano";
    planDistributionMap.set(planName, (planDistributionMap.get(planName) ?? 0) + 1);
  });

  return {
    system,
    commercial: {
      active: activeSubscriptions.length,
      pending: pendingSubscriptions.length,
      expired: expiredSubscriptions.length,
      trial: trialSubscriptions.length,
      estimatedRevenueCents,
      planDistribution: Array.from(planDistributionMap.entries()).map(([planName, count]) => ({
        planName,
        count
      }))
    },
    tenants: {
      total: tenantSummaries.length,
      ready: tenantSummaries.filter((tenant) => tenant.diagnostics.readiness.status === "ready").length,
      incompleteConfig: tenantSummaries.filter((tenant) => !tenant.isOnboardingComplete).length,
      usingMock: tenantSummaries.filter((tenant) => tenant.usesMockMode).length,
      withoutWhatsApp: tenantSummaries.filter((tenant) => tenant.missingWhatsApp).length
    },
    tenantSummaries
  };
}
