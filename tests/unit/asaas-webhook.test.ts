import { beforeEach, describe, expect, it } from "vitest";

import { mockStore } from "../../lib/mock-store";
import { POST } from "../../app/api/webhook/asaas/route";

function makeRequest(body: Record<string, unknown>, token?: string) {
  return new Request("http://localhost:3000/api/webhook/asaas", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "asaas-access-token": token } : {})
    },
    body: JSON.stringify(body)
  });
}

function seedWebhookSubscription(overrides: {
  status?: "PENDING" | "ACTIVE";
  paymentStatus?: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "CANCELED";
} = {}) {
  const ts = mockStore.now();
  const subscription = {
    id: mockStore.createId("sub"),
    businessId: "biz_demo",
    planId: "plan_pro",
    status: overrides.status ?? "PENDING",
    asaasCustomerId: "cus_123",
    asaasSubscriptionId: "sub_asaas_123",
    asaasPaymentId: "pay_123",
    checkoutUrl: "https://sandbox.asaas.com/i/pay_123",
    paymentStatus: overrides.paymentStatus ?? "PENDING",
    paidAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    activatedAt: overrides.status === "ACTIVE" ? ts : null,
    canceledAt: null,
    externalReference: null,
    createdAt: ts,
    updatedAt: ts
  };

  mockStore.subscriptions.push(subscription);
  return subscription;
}

describe("POST /api/webhook/asaas", () => {
  beforeEach(() => {
    process.env.ASAAS_WEBHOOK_TOKEN = "test-webhook-token";
    mockStore.reset();
  });

  it("rejects webhook requests without token", async () => {
    const response = await POST(
      makeRequest({
        event: "PAYMENT_RECEIVED",
        payment: { id: "pay_123", subscription: "sub_asaas_123" }
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(401);
    expect(payload.error).toBe("Webhook nao autorizado.");
  });

  it("rejects webhook requests with invalid token", async () => {
    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED",
          payment: { id: "pay_123", subscription: "sub_asaas_123" }
        },
        "wrong-token"
      )
    );

    expect(response.status).toBe(401);
  });

  it("activates the correct subscription on PAYMENT_RECEIVED", async () => {
    const seeded = seedWebhookSubscription();

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "RECEIVED"
          }
        },
        "test-webhook-token"
      )
    );

    const payload = await response.json();
    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);

    expect(response.status).toBe(200);
    expect(payload.status).toBe("processed");
    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.paymentStatus).toBe("RECEIVED");
    expect(updated?.paidAt).not.toBeNull();
  });

  it("activates the correct subscription on PAYMENT_CONFIRMED", async () => {
    const seeded = seedWebhookSubscription();

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_CONFIRMED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "CONFIRMED"
          }
        },
        "test-webhook-token"
      )
    );

    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);
    expect(response.status).toBe(200);
    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.paymentStatus).toBe("CONFIRMED");
  });

  it("marks payment as overdue without activating the subscription", async () => {
    const seeded = seedWebhookSubscription();

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_OVERDUE",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "OVERDUE"
          }
        },
        "test-webhook-token"
      )
    );

    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);
    expect(response.status).toBe(200);
    expect(updated?.status).toBe("EXPIRED");
    expect(updated?.paymentStatus).toBe("OVERDUE");
    expect(updated?.activatedAt).toBeNull();
  });

  it("cancels the subscription on PAYMENT_DELETED", async () => {
    const seeded = seedWebhookSubscription({ status: "ACTIVE", paymentStatus: "RECEIVED" });

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_DELETED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123"
          }
        },
        "test-webhook-token"
      )
    );

    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);
    expect(response.status).toBe(200);
    expect(updated?.status).toBe("CANCELED");
    expect(updated?.paymentStatus).toBe("CANCELED");
  });

  it("returns 200 for unknown events without breaking", async () => {
    const seeded = seedWebhookSubscription();

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_CHECKOUT_VIEWED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123"
          }
        },
        "test-webhook-token"
      )
    );

    const payload = await response.json();
    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);
    expect(response.status).toBe(200);
    expect(payload.status).toBe("ignored");
    expect(updated?.status).toBe("PENDING");
  });

  it("returns a safe error for invalid payload", async () => {
    const response = await POST(
      makeRequest(
        {
          payment: {
            id: "pay_123"
          }
        },
        "test-webhook-token"
      )
    );

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.error).toBe("Payload de webhook invalido.");
  });

  it("does not corrupt the subscription on duplicate events", async () => {
    const seeded = seedWebhookSubscription();

    await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "RECEIVED"
          }
        },
        "test-webhook-token"
      )
    );

    const firstUpdate = mockStore.subscriptions.find((item) => item.id === seeded.id);
    const firstActivatedAt = firstUpdate?.activatedAt;
    const firstPaidAt = firstUpdate?.paidAt;

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "RECEIVED"
          }
        },
        "test-webhook-token"
      )
    );

    const secondUpdate = mockStore.subscriptions.find((item) => item.id === seeded.id);
    expect(response.status).toBe(200);
    expect(secondUpdate?.activatedAt).toBe(firstActivatedAt);
    expect(secondUpdate?.paidAt).toBe(firstPaidAt);
    expect(secondUpdate?.status).toBe("ACTIVE");
  });

  it("ignores a repeated webhook event id even if the payload is replayed with a different payment status", async () => {
    const seeded = seedWebhookSubscription();

    const firstResponse = await POST(
      makeRequest(
        {
          id: "evt_asaas_1",
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "RECEIVED"
          }
        },
        "test-webhook-token"
      )
    );

    const replayResponse = await POST(
      makeRequest(
        {
          id: "evt_asaas_1",
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_123",
            subscription: "sub_asaas_123",
            status: "CONFIRMED"
          }
        },
        "test-webhook-token"
      )
    );

    const firstPayload = await firstResponse.json();
    const replayPayload = await replayResponse.json();
    const updated = mockStore.subscriptions.find((item) => item.id === seeded.id);

    expect(firstPayload.status).toBe("processed");
    expect(replayPayload.status).toBe("duplicate");
    expect(updated?.paymentStatus).toBe("RECEIVED");
  });

  it("does not expose secrets or stack traces in the response", async () => {
    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED"
        },
        "test-webhook-token"
      )
    );

    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(400);
    expect(serialized).not.toContain("ASAAS_WEBHOOK_TOKEN");
    expect(serialized).not.toContain("stack");
    expect(payload.error).toBe("Payload de webhook invalido.");
  });

  it("ignores payment events that cannot be reconciled by asaas ids", async () => {
    seedWebhookSubscription();

    const response = await POST(
      makeRequest(
        {
          event: "PAYMENT_RECEIVED",
          payment: {
            id: "pay_unmatched",
            subscription: "sub_unmatched",
            status: "RECEIVED"
          }
        },
        "test-webhook-token"
      )
    );

    const payload = await response.json();
    const untouched = mockStore.subscriptions.find((item) => item.asaasPaymentId === "pay_123");

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ignored");
    expect(untouched?.status).toBe("PENDING");
    expect(untouched?.paidAt).toBeNull();
  });
});
