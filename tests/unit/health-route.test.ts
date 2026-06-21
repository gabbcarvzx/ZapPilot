import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("health route", () => {
  it("returns a safe JSON payload for operational diagnostics", async () => {
    vi.doMock("../../server/services/operational-diagnostics-service", () => ({
      getSystemOperationalDiagnostics: vi.fn().mockResolvedValue({
        app: { status: "healthy", detail: "App responding." },
        database: { status: "healthy", mode: "Live", detail: "Database reachable." },
        auth: { status: "healthy", mode: "Live", detail: "Auth secret configured." },
        gemini: { status: "degraded", mode: "Mock", detail: "Gemini running in mock mode." },
        whatsapp: { status: "degraded", mode: "Mock", detail: "WhatsApp running in mock mode." },
        billing: { status: "not_configured", mode: "Not integrated yet", detail: "Billing not integrated on master." },
        timestamp: "2026-06-21T16:00:00.000Z",
        secretsExposed: false
      })
    }));

    const { GET } = await import("../../app/api/health/route");
    const response = await GET(new Request("http://localhost:3000/api/health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ok");
    expect(payload.billing.mode).toBe("Not integrated yet");
    expect(payload.secretsExposed).toBe(false);
    expect(payload).not.toHaveProperty("authSecret");
    expect(payload).not.toHaveProperty("whatsappAccessToken");
  });
});
