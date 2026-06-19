import { describe, expect, it } from "vitest";

import { getActivationGuidance } from "../../server/services/subscription-service";

describe("activation guidance", () => {
  it("explains in plain language why pending businesses are blocked", () => {
    const guidance = getActivationGuidance({
      subscriptionStatus: "PENDING",
      whatsappActive: false,
      readinessStatus: "blocked"
    });

    expect(guidance.tone).toBe("warning");
    expect(guidance.title).toContain("Plano pendente");
    expect(guidance.detail).toContain("operacao");
  });

  it("confirms when the business is ready for real testing after activation", () => {
    const guidance = getActivationGuidance({
      subscriptionStatus: "ACTIVE",
      whatsappActive: true,
      readinessStatus: "ready"
    });

    expect(guidance.tone).toBe("success");
    expect(guidance.title).toContain("Pronto para teste");
    expect(guidance.nextStep).toContain("WhatsApp");
  });

  it("keeps active businesses in an operator follow-up state when setup is incomplete", () => {
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
