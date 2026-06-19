import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadDiagnosticsModule(env: Record<string, string> = {}) {
  vi.resetModules();

  delete process.env.DATABASE_URL;
  delete process.env.GEMINI_API_KEY;
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  Object.assign(process.env, env);

  return import("../../server/services/integrations-service");
}

describe("tenant diagnostics readiness", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("marks reply ready when subscription is active and WhatsApp plus database are live", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      GEMINI_API_KEY: "gemini-live",
      WHATSAPP_ACCESS_TOKEN: "env-token",
      WHATSAPP_PHONE_NUMBER_ID: "env-phone",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "env-waba",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "env-verify"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "ACTIVE",
      whatsappConfig: {
        accessToken: "token",
        metaBusinessAccountId: "waba_123",
        metaPhoneNumberId: "phone_123",
        verifyToken: "verify_123",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: true,
        geminiFailureMode: false,
        humanFallbackAvailable: true,
        webhookVerificationOperational: true
      }
    });

    expect(summary.readiness.status).toBe("ready");
    expect(summary.plan.status).toBe("healthy");
    expect(summary.whatsapp.status).toBe("healthy");
    expect(summary.database.status).toBe("healthy");
    expect(summary.webhook.status).toBe("healthy");
  });

  it("blocks reply readiness when subscription is pending", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      GEMINI_API_KEY: "gemini-live",
      WHATSAPP_ACCESS_TOKEN: "env-token",
      WHATSAPP_PHONE_NUMBER_ID: "env-phone",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "env-waba",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "env-verify"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "PENDING",
      whatsappConfig: {
        accessToken: "token",
        metaBusinessAccountId: "waba_123",
        metaPhoneNumberId: "phone_123",
        verifyToken: "verify_123",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: true,
        geminiFailureMode: false,
        humanFallbackAvailable: true,
        webhookVerificationOperational: true
      }
    });

    expect(summary.readiness.status).toBe("blocked");
    expect(summary.readiness.reason).toContain("plano");
  });

  it("reports Gemini failure mode as degraded and keeps the business operational when human assistance exists", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      GEMINI_API_KEY: "gemini-live",
      WHATSAPP_ACCESS_TOKEN: "env-token",
      WHATSAPP_PHONE_NUMBER_ID: "env-phone",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "env-waba",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "env-verify"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "ACTIVE",
      whatsappConfig: {
        accessToken: "token",
        metaBusinessAccountId: "waba_123",
        metaPhoneNumberId: "phone_123",
        verifyToken: "verify_123",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: true,
        geminiFailureMode: true,
        humanFallbackAvailable: true,
        webhookVerificationOperational: true
      }
    });

    expect(summary.ai.status).toBe("degraded");
    expect(summary.ai.label).toContain("atendimento humano");
    expect(summary.readiness.status).toBe("ready");
  });

  it("blocks reply readiness when WhatsApp still depends on mock global credentials", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      GEMINI_API_KEY: "gemini-live",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "env-verify"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "ACTIVE",
      whatsappConfig: {
        accessToken: "tenant-token",
        metaBusinessAccountId: "tenant-waba",
        metaPhoneNumberId: "tenant-phone",
        verifyToken: "tenant-verify",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: true,
        webhookVerificationOperational: true
      }
    });

    expect(summary.whatsapp.status).toBe("blocked");
    expect(summary.readiness.status).toBe("blocked");
    expect(summary.readiness.reason).toContain("WhatsApp");
  });

  it("treats webhook as healthy when the verification route can answer the current flow", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      GEMINI_API_KEY: "gemini-live",
      WHATSAPP_ACCESS_TOKEN: "env-token",
      WHATSAPP_PHONE_NUMBER_ID: "env-phone",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "env-waba"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "ACTIVE",
      whatsappConfig: {
        accessToken: "tenant-token",
        metaBusinessAccountId: "tenant-waba",
        metaPhoneNumberId: "tenant-phone",
        verifyToken: "tenant-verify",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: true,
        webhookVerificationOperational: true
      }
    });

    expect(summary.webhook.status).toBe("healthy");
    expect(summary.webhook.label).toBe("Verificado");
  });

  it("blocks AI readiness when Gemini is unavailable and no human support was declared", async () => {
    const { getTenantDiagnosticSummary } = await loadDiagnosticsModule({
      DATABASE_URL: "postgres://tenant-db",
      WHATSAPP_ACCESS_TOKEN: "env-token",
      WHATSAPP_PHONE_NUMBER_ID: "env-phone",
      WHATSAPP_BUSINESS_ACCOUNT_ID: "env-waba",
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: "env-verify"
    });

    const summary = getTenantDiagnosticSummary({
      subscriptionStatus: "ACTIVE",
      whatsappConfig: {
        accessToken: "tenant-token",
        metaBusinessAccountId: "tenant-waba",
        metaPhoneNumberId: "tenant-phone",
        verifyToken: "tenant-verify",
        isActive: true
      },
      runtime: {
        databaseConfigured: true,
        geminiLive: false,
        geminiFailureMode: false,
        webhookVerificationOperational: true
      }
    });

    expect(summary.ai.status).toBe("blocked");
    expect(summary.readiness.status).toBe("blocked");
    expect(summary.readiness.reason).toContain("atendimento humano");
  });
});
