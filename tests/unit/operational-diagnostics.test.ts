import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("operational diagnostics service", () => {
  it("reports billing as integrated in code but pending env configuration and keeps secret-safe runtime flags", async () => {
    vi.doMock("../../lib/env", () => ({
      env: {
        authSecret: "safe-secret",
        whatsappWebhookVerifyToken: "verify-token"
      },
      envFlags: {
        databaseConfigured: true,
        authConfigured: true,
        geminiLive: false,
        whatsappLive: false,
        billingConfigured: false,
        adminEmailsConfigured: true
      },
      getIntegrationMode: (live: boolean) => (live ? "Ativo" : "Simulado")
    }));

    vi.doMock("../../lib/prisma", () => ({
      prisma: {
        $queryRaw: vi.fn().mockResolvedValue([{ healthcheck: 1 }])
      }
    }));

    const { getSystemOperationalDiagnostics } = await import("../../server/services/operational-diagnostics-service");

    const diagnostics = await getSystemOperationalDiagnostics();

    expect(diagnostics.billing.status).toBe("degraded");
    expect(diagnostics.billing.mode).toBe("Mock");
    expect(diagnostics.database.latencyMs).toBeTypeOf("number");
    expect(diagnostics.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(diagnostics.billing.provider).toBe("ASAAS");
    expect(diagnostics.auth.status).toBe("healthy");
    expect(diagnostics.database.status).toBe("healthy");
    expect(diagnostics.secretsExposed).toBe(false);
  });

  it("reports tenant WhatsApp readiness and AI mode without requiring billing", async () => {
    vi.doMock("../../lib/env", () => ({
      env: {
        authSecret: "safe-secret",
        whatsappWebhookVerifyToken: ""
      },
      envFlags: {
        databaseConfigured: false,
        authConfigured: true,
        geminiLive: true,
        whatsappLive: true,
        billingConfigured: false,
        adminEmailsConfigured: true
      },
      getIntegrationMode: (live: boolean) => (live ? "Ativo" : "Simulado")
    }));

    vi.doMock("../../lib/prisma", () => ({
      prisma: null
    }));

    const { getTenantOperationalDiagnostics } = await import("../../server/services/operational-diagnostics-service");

    const diagnostics = await getTenantOperationalDiagnostics({
      subscriptionStatus: "PENDING",
      whatsappConfig: {
        isActive: true,
        metaBusinessAccountId: "waba_123",
        metaPhoneNumberId: "phone_123",
        accessToken: "tenant-token",
        verifyToken: "tenant-verify",
        webhookStatus: "draft"
      }
    });

    expect(diagnostics.plan.status).toBe("blocked");
    expect(diagnostics.whatsapp.status).toBe("healthy");
    expect(diagnostics.ai.mode).toBe("Live");
    expect(diagnostics.auth.label).toBe("Ativo");
    expect(diagnostics.billing.mode).toBe("Mock");
    expect(diagnostics.whatsapp.provider).toBe("WhatsApp Cloud API");
  });

  it("builds an admin operational summary without exposing billing integration as active", async () => {
    vi.doMock("../../lib/env", () => ({
      env: {
        authSecret: "safe-secret",
        whatsappWebhookVerifyToken: "verify-token"
      },
      envFlags: {
        databaseConfigured: true,
        authConfigured: true,
        geminiLive: false,
        whatsappLive: false,
        billingConfigured: false,
        adminEmailsConfigured: true
      },
      getIntegrationMode: (live: boolean) => (live ? "Ativo" : "Simulado")
    }));

    vi.doMock("../../lib/prisma", () => ({
      prisma: {
        $queryRaw: vi.fn().mockResolvedValue([{ healthcheck: 1 }])
      }
    }));

    vi.doMock("../../server/services/subscription-service", () => ({
      getAllBusinessesWithSubscriptions: vi.fn().mockResolvedValue([
        {
          id: "biz_1",
          name: "Tenant One",
          isOnboardingComplete: false,
          owner: { email: "owner@example.com" },
          subscriptions: [{ status: "ACTIVE", plan: { name: "Start", priceCents: 4900 } }],
          whatsappConfig: {
            isActive: false,
            metaPhoneNumberId: "",
            metaBusinessAccountId: "",
            accessToken: "",
            verifyToken: "",
            webhookStatus: "draft"
          }
        }
      ])
    }));

    const { getAdminOperationalSummary } = await import("../../server/services/operational-diagnostics-service");

    const summary = await getAdminOperationalSummary();

    expect(summary.system.billing.mode).toBe("Mock");
    expect(summary.tenants.total).toBe(1);
    expect(summary.tenants.incompleteConfig).toBe(1);
    expect(summary.tenants.withoutWhatsApp).toBe(1);
    expect(summary.tenantSummaries[0]?.usesMockMode).toBe(true);
    expect(summary.commercial.active).toBe(1);
    expect(summary.commercial.pending).toBe(0);
    expect(summary.commercial.trial).toBe(0);
    expect(summary.commercial.estimatedRevenueCents).toBeGreaterThan(0);
  });
});
