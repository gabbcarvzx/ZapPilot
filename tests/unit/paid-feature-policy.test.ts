import { describe, expect, it } from "vitest";

import { getPaidFeaturePolicy } from "../../server/policies/paid-feature-policy";

describe("paid feature policy", () => {
  it("releases paid resources for active subscriptions", () => {
    const policy = getPaidFeaturePolicy("ACTIVE");

    expect(policy.canUseRealAutomation).toBe(true);
    expect(policy.canSendRealWhatsApp).toBe(true);
    expect(policy.canActivateRealConnection).toBe(true);
    expect(policy.canAccessBasicConfiguration).toBe(true);
    expect(policy.commercialStatus).toBe("active");
  });

  it("blocks paid resources for pending subscriptions", () => {
    const policy = getPaidFeaturePolicy("PENDING");

    expect(policy.canUseRealAutomation).toBe(false);
    expect(policy.canSendRealWhatsApp).toBe(false);
    expect(policy.canActivateRealConnection).toBe(false);
    expect(policy.canAccessBasicConfiguration).toBe(true);
    expect(policy.userMessageTitle).toContain("Pagamento pendente");
  });

  it("blocks paid resources for expired subscriptions", () => {
    const policy = getPaidFeaturePolicy("EXPIRED");

    expect(policy.canUseRealAutomation).toBe(false);
    expect(policy.canSendRealWhatsApp).toBe(false);
    expect(policy.canActivateRealConnection).toBe(false);
    expect(policy.canAccessBasicConfiguration).toBe(true);
    expect(policy.userMessageTitle).toContain("Plano expirado");
  });

  it("blocks paid resources for canceled subscriptions", () => {
    const policy = getPaidFeaturePolicy("CANCELED");

    expect(policy.canUseRealAutomation).toBe(false);
    expect(policy.canSendRealWhatsApp).toBe(false);
    expect(policy.canActivateRealConnection).toBe(false);
    expect(policy.canAccessBasicConfiguration).toBe(true);
    expect(policy.userMessageTitle).toContain("Plano cancelado");
  });
});
