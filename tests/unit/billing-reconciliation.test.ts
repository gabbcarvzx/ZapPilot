import { beforeEach, describe, expect, it } from "vitest";

import { mockStore } from "../../lib/mock-store";
import { reconcileSubscriptionWithRemoteSnapshot } from "../../server/services/billing-service";

function seedPendingSubscription() {
  const ts = mockStore.now();
  const subscription = {
    id: mockStore.createId("sub"),
    businessId: "biz_demo",
    planId: "plan_pro",
    status: "PENDING" as const,
    asaasCustomerId: "cus_123",
    asaasSubscriptionId: "sub_asaas_123",
    asaasPaymentId: "pay_123",
    checkoutUrl: "https://sandbox.asaas.com/i/pay_123",
    paymentStatus: "PENDING" as const,
    paidAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    activatedAt: null,
    canceledAt: null,
    externalReference: null,
    createdAt: ts,
    updatedAt: ts
  };

  mockStore.subscriptions.push(subscription);
  return subscription;
}

describe("billing reconciliation", () => {
  beforeEach(() => {
    mockStore.reset();
  });

  it("reconciles a pending local subscription with an active remote payment snapshot", async () => {
    const seeded = seedPendingSubscription();

    const result = await reconcileSubscriptionWithRemoteSnapshot({
      asaasPaymentId: "pay_123",
      status: "RECEIVED",
      event: "PAYMENT_RECEIVED"
    });

    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);

    expect(result.status).toBe("updated");
    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.paymentStatus).toBe("RECEIVED");
    expect(updated?.paidAt).not.toBeNull();
  });

  it("skips reconciliation safely when no local subscription matches the remote snapshot", async () => {
    const result = await reconcileSubscriptionWithRemoteSnapshot({
      asaasPaymentId: "pay_missing",
      status: "RECEIVED",
      event: "PAYMENT_RECEIVED"
    });

    expect(result.status).toBe("ignored");
  });
});
