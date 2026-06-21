import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockStore } from "../../lib/mock-store";
import { guardPaidFeatureAccess } from "../../server/guards/paid-feature-guard";
import { handleAsaasWebhook, startCheckout } from "../../server/services/billing-service";

function createGateway() {
  return {
    createOrUpdateCustomer: vi.fn(async () => ({
      id: "cus_flow_123"
    })),
    createSubscriptionCheckout: vi.fn(async () => ({
      id: "sub_flow_asaas_123",
      paymentId: "pay_flow_123",
      invoiceUrl: "https://sandbox.asaas.com/i/pay_flow_123",
      status: "PENDING"
    }))
  };
}

function makeCheckoutInput() {
  return {
    plan: "pro",
    name: "Fluxo Cliente",
    email: "fluxo@example.com",
    phone: "11999999999",
    document: "12345678900",
    password: "senha-segura",
    confirmPassword: "senha-segura"
  };
}

describe("billing flow integration", () => {
  beforeEach(() => {
    mockStore.reset();
  });

  it("keeps paid resources blocked until the webhook activates the subscription", async () => {
    const checkout = await startCheckout(makeCheckoutInput(), {
      gateway: createGateway()
    });

    expect(checkout.outcome).toBe("payment_required");

    const pendingAccess = guardPaidFeatureAccess({
      subscriptionStatus: checkout.subscription.status,
      resource: "real_whatsapp_send"
    });

    expect(pendingAccess.ok).toBe(false);

    const webhookResult = await handleAsaasWebhook({
      id: "evt_flow_1",
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_flow_123",
        subscription: "sub_flow_asaas_123",
        status: "RECEIVED"
      }
    });

    expect(webhookResult.status).toBe("processed");

    const activeSubscription = mockStore.subscriptions.find((item) => item.id === checkout.subscription.id);
    const activeAccess = guardPaidFeatureAccess({
      subscriptionStatus: activeSubscription?.status,
      resource: "real_whatsapp_send"
    });

    expect(activeSubscription?.status).toBe("ACTIVE");
    expect(activeAccess.ok).toBe(true);
  });
});
