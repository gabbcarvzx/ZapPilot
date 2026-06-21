import { describe, expect, it } from "vitest";

import { guardPaidFeatureAccess } from "../../server/guards/paid-feature-guard";

describe("paid feature guard", () => {
  it("authorizes active subscriptions", () => {
    const result = guardPaidFeatureAccess({
      subscriptionStatus: "ACTIVE",
      resource: "real_whatsapp_send"
    });

    expect(result.ok).toBe(true);
    expect(result.httpStatus).toBe(200);
  });

  it("blocks pending subscriptions with a payment pending message", () => {
    const result = guardPaidFeatureAccess({
      subscriptionStatus: "PENDING",
      resource: "real_whatsapp_send"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(402);
      expect(result.message).toContain("confirmacao do pagamento");
    }
  });

  it("blocks expired subscriptions with an expired-plan message", () => {
    const result = guardPaidFeatureAccess({
      subscriptionStatus: "EXPIRED",
      resource: "real_whatsapp_send"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(402);
      expect(result.message).toContain("plano expirou");
    }
  });

  it("blocks canceled subscriptions with a canceled-plan message", () => {
    const result = guardPaidFeatureAccess({
      subscriptionStatus: "CANCELED",
      resource: "real_whatsapp_send"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(402);
      expect(result.message).toContain("plano foi cancelado");
    }
  });
});
