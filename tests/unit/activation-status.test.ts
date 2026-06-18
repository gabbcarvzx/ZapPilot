import { describe, expect, it } from "vitest";

import { getActivationGuidance } from "../../server/services/subscription-service";

describe("activation guidance", () => {
  it("explains in plain language why pending tenants are blocked", () => {
    const guidance = getActivationGuidance({
      subscriptionStatus: "PENDING",
      whatsappActive: false,
      readinessStatus: "blocked"
    });

    expect(guidance.tone).toBe("warning");
    expect(guidance.title).toContain("Plano pendente");
    expect(guidance.detail).toContain("admin");
  });

  it("confirms when the tenant is ready for live testing after activation", () => {
    const guidance = getActivationGuidance({
      subscriptionStatus: "ACTIVE",
      whatsappActive: true,
      readinessStatus: "ready"
    });

    expect(guidance.tone).toBe("success");
    expect(guidance.title).toContain("Pronto para teste");
    expect(guidance.nextStep).toContain("WhatsApp");
  });

  it("keeps active tenants in an operator follow-up state when setup is incomplete", () => {
    const guidance = getActivationGuidance({
      subscriptionStatus: "ACTIVE",
      whatsappActive: false,
      readinessStatus: "blocked"
    });

    expect(guidance.tone).toBe("warning");
    expect(guidance.title).toContain("Plano ativo");
    expect(guidance.nextStep).toContain("WhatsApp");
  });
});
