import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete process.env.SYSTEM_VALIDATE_KEY;
});

describe("system validate route", () => {
  it("returns a safe validation report for authorized requests", async () => {
    process.env.SYSTEM_VALIDATE_KEY = "validate-secret";

    vi.doMock("../../lib/env", () => ({
      env: {
        systemValidateKey: "validate-secret"
      },
      envFlags: {
        mockModeEnabled: false
      },
      getEnvironmentValidationItems: vi.fn(() => [
        { name: "AUTH_SECRET", requiredInProduction: true, configured: true, category: "auth" }
      ]),
      getMissingRequiredProductionEnvs: vi.fn(() => [])
    }));

    vi.doMock("../../server/services/operational-diagnostics-service", () => ({
      getSystemOperationalDiagnostics: vi.fn().mockResolvedValue({
        app: { status: "healthy", detail: "App responding." },
        database: { status: "healthy", mode: "Live", label: "Ativo", detail: "Database reachable.", provider: "PostgreSQL", latencyMs: 12 },
        auth: { status: "healthy", mode: "Live", label: "Ativo", detail: "Auth configured.", provider: "Auth.js" },
        gemini: { status: "healthy", mode: "Live", label: "Ativo", detail: "Gemini live.", provider: "Gemini" },
        whatsapp: { status: "healthy", mode: "Live", label: "Ativo", detail: "WhatsApp live.", provider: "WhatsApp Cloud API" },
        billing: { status: "healthy", mode: "Live", label: "Ativo", detail: "Billing live.", provider: "ASAAS" },
        timestamp: "2026-06-21T16:00:00.000Z",
        secretsExposed: false
      })
    }));

    const { GET } = await import("../../app/api/system/validate/route");
    const response = await GET(
      new Request("http://localhost:3000/api/system/validate", {
        headers: {
          "x-system-validate-key": "validate-secret"
        }
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ok");
    expect(payload.mockModeEnabled).toBe(false);
    expect(payload.diagnostics.secretsExposed).toBe(false);
    expect(JSON.stringify(payload)).not.toContain("validate-secret");
  });

  it("rejects unauthorized requests when a validation key is configured", async () => {
    process.env.SYSTEM_VALIDATE_KEY = "validate-secret";

    vi.doMock("../../lib/env", () => ({
      env: {
        systemValidateKey: "validate-secret"
      },
      envFlags: {
        mockModeEnabled: false
      },
      getEnvironmentValidationItems: vi.fn(() => []),
      getMissingRequiredProductionEnvs: vi.fn(() => [])
    }));

    vi.doMock("../../server/services/operational-diagnostics-service", () => ({
      getSystemOperationalDiagnostics: vi.fn()
    }));

    const { GET } = await import("../../app/api/system/validate/route");
    const response = await GET(new Request("http://localhost:3000/api/system/validate"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Nao autorizado.");
  });
});
