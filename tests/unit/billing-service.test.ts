import { hashSync } from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockStore } from "../../lib/mock-store";
import { startCheckout } from "../../server/services/billing-service";

function makeCheckoutInput(overrides: Record<string, unknown> = {}) {
  return {
    plan: "pro",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11999999999",
    document: "12345678900",
    password: "senha-segura",
    confirmPassword: "senha-segura",
    ...overrides
  };
}

function createGateway(overrides: {
  createCustomer?: ReturnType<typeof vi.fn>;
  createSubscription?: ReturnType<typeof vi.fn>;
} = {}) {
  return {
    createOrUpdateCustomer:
      overrides.createCustomer ??
      vi.fn(async () => ({
        id: "cus_123"
      })),
    createSubscriptionCheckout:
      overrides.createSubscription ??
      vi.fn(async () => ({
        id: "sub_asaas_123",
        paymentId: "pay_123",
        invoiceUrl: "https://sandbox.asaas.com/i/pay_123",
        status: "PENDING"
      }))
  };
}

function seedExistingAccount({
  email,
  subscriptionStatus,
  checkoutUrl = null,
  asaasCustomerId = null
}: {
  email: string;
  subscriptionStatus: "PENDING" | "ACTIVE";
  checkoutUrl?: string | null;
  asaasCustomerId?: string | null;
}) {
  const ts = mockStore.now();
  const userId = mockStore.createId("user");
  const businessId = mockStore.createId("biz");
  const subscriptionId = mockStore.createId("sub");

  mockStore.users.push({
    id: userId,
    name: "Cliente Existente",
    email,
    passwordHash: hashSync("senha-segura", 10),
    role: "CUSTOMER",
    businessId,
    createdAt: ts,
    updatedAt: ts
  });

  mockStore.businesses.push({
    id: businessId,
    ownerUserId: userId,
    name: "Cliente Existente LTDA",
    slug: `cliente-${subscriptionId}`,
    niche: "Servicos",
    document: "12345678900",
    address: "",
    phone: "11999999999",
    whatsappNumber: "",
    businessHours: "",
    welcomeMessage: "Ola. Como posso ajudar?",
    closedMessage: "Agora estamos fora do horario.",
    tone: "Profissional, simples, direto e comercial",
    isOnboardingComplete: false,
    createdAt: ts,
    updatedAt: ts
  });

  mockStore.subscriptions.push({
    id: subscriptionId,
    businessId,
    planId: "plan_start",
    status: subscriptionStatus,
    asaasCustomerId,
    asaasSubscriptionId: checkoutUrl ? "sub_asaas_existing" : null,
    asaasPaymentId: checkoutUrl ? "pay_existing" : null,
    checkoutUrl,
    paymentStatus: checkoutUrl ? "PENDING" : "CHECKOUT_PENDING",
    paidAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    activatedAt: subscriptionStatus === "ACTIVE" ? ts : null,
    canceledAt: null,
    externalReference: `subscription:${subscriptionId}`,
    createdAt: ts,
    updatedAt: ts
  });

  return { userId, businessId, subscriptionId };
}

describe("startCheckout", () => {
  beforeEach(() => {
    mockStore.reset();
  });

  it("fails when the selected plan is invalid", async () => {
    const gateway = createGateway();

    await expect(startCheckout(makeCheckoutInput({ plan: "enterprise" }), { gateway })).rejects.toThrow();
    expect(mockStore.users.find((item) => item.email === "maria@example.com")).toBeUndefined();
  });

  it("creates user, business and a pending subscription for a new customer", async () => {
    const gateway = createGateway();

    const result = await startCheckout(makeCheckoutInput(), { gateway });

    const user = mockStore.users.find((item) => item.email === "maria@example.com");
    expect(user).toBeDefined();

    const business = mockStore.businesses.find((item) => item.ownerUserId === user?.id);
    expect(business).toBeDefined();

    const subscription = mockStore.subscriptions.find((item) => item.businessId === business?.id);
    expect(subscription?.status).toBe("PENDING");
    expect(subscription?.asaasCustomerId).toBe("cus_123");
    expect(subscription?.asaasSubscriptionId).toBe("sub_asaas_123");
    expect(subscription?.asaasPaymentId).toBe("pay_123");
    expect(subscription?.checkoutUrl).toBe("https://sandbox.asaas.com/i/pay_123");
    expect(subscription?.paymentStatus).toBe("PENDING");
    expect(result.redirectTo).toBe("https://sandbox.asaas.com/i/pay_123");
  });

  it("reuses an existing pending subscription flow without duplicating local records", async () => {
    const email = "pending@example.com";
    const existing = seedExistingAccount({
      email,
      subscriptionStatus: "PENDING"
    });
    const gateway = createGateway();
    const usersBefore = mockStore.users.length;
    const businessesBefore = mockStore.businesses.length;
    const subscriptionsBefore = mockStore.subscriptions.length;

    const result = await startCheckout(makeCheckoutInput({ email, name: "Cliente Existente" }), { gateway });

    expect(mockStore.users).toHaveLength(usersBefore);
    expect(mockStore.businesses).toHaveLength(businessesBefore);
    expect(mockStore.subscriptions).toHaveLength(subscriptionsBefore);
    expect(result.subscription.id).toBe(existing.subscriptionId);
    expect(result.redirectTo).toBe("https://sandbox.asaas.com/i/pay_123");
  });

  it("does not generate a new checkout when the latest subscription is active", async () => {
    const email = "active@example.com";
    const existing = seedExistingAccount({
      email,
      subscriptionStatus: "ACTIVE",
      checkoutUrl: "https://sandbox.asaas.com/i/existing"
    });
    const gateway = createGateway();

    const result = await startCheckout(makeCheckoutInput({ email, name: "Cliente Ativo" }), { gateway });

    expect(result.outcome).toBe("active_exists");
    expect(result.redirectTo).toBe("/dashboard");
    expect(result.subscription.id).toBe(existing.subscriptionId);
    expect(gateway.createOrUpdateCustomer).not.toHaveBeenCalled();
    expect(gateway.createSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it("returns a safe error when the asaas checkout fails and preserves critical local data", async () => {
    const gateway = createGateway({
      createSubscription: vi.fn(async () => {
        throw new Error("asaas internal stack");
      })
    });

    await expect(startCheckout(makeCheckoutInput(), { gateway })).rejects.toThrow(
      "Nao foi possivel iniciar o checkout agora."
    );

    const user = mockStore.users.find((item) => item.email === "maria@example.com");
    expect(user).toBeDefined();

    const business = mockStore.businesses.find((item) => item.ownerUserId === user?.id);
    expect(business).toBeDefined();

    const subscription = mockStore.subscriptions.find((item) => item.businessId === business?.id);
    expect(subscription?.status).toBe("PENDING");
    expect(subscription?.asaasCustomerId).toBe("cus_123");
    expect(subscription?.asaasSubscriptionId).toBeNull();
    expect(subscription?.asaasPaymentId).toBeNull();
    expect(subscription?.checkoutUrl).toBeNull();
  });

  it("returns the payment url for a successful checkout", async () => {
    const gateway = createGateway({
      createSubscription: vi.fn(async () => ({
        id: "sub_asaas_456",
        paymentId: "pay_456",
        invoiceUrl: "https://sandbox.asaas.com/i/pay_456",
        status: "PENDING"
      }))
    });

    const result = await startCheckout(makeCheckoutInput({ email: "checkout@example.com" }), { gateway });

    expect(result.outcome).toBe("payment_required");
    expect(result.redirectTo).toBe("https://sandbox.asaas.com/i/pay_456");
  });
});
