import { beforeEach, describe, expect, it, vi } from "vitest";

const { startCheckoutMock } = vi.hoisted(() => ({
  startCheckoutMock: vi.fn()
}));

vi.mock("../../server/services/billing-service", () => ({
  startCheckout: startCheckoutMock
}));

import { POST } from "../../app/api/billing/checkout/route";

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/billing/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    plan: "pro",
    name: "Maria Silva",
    email: "maria@example.com",
    phone: "11999999999",
    cpfCnpj: "12345678900",
    password: "senha-segura",
    confirmPassword: "senha-segura",
    ...overrides
  };
}

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    startCheckoutMock.mockReset();
  });

  it("returns checkoutUrl for a valid checkout request", async () => {
    startCheckoutMock.mockResolvedValueOnce({
      outcome: "payment_required",
      redirectTo: "https://sandbox.asaas.com/i/pay_123",
      subscription: {
        status: "PENDING",
        paymentStatus: "PENDING",
        checkoutUrl: "https://sandbox.asaas.com/i/pay_123"
      }
    });

    const response = await POST(
      makeRequest(validPayload(), {
        "x-request-id": "req_checkout_123"
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      checkoutUrl: "https://sandbox.asaas.com/i/pay_123",
      subscriptionStatus: "PENDING",
      paymentStatus: "PENDING",
      redirectTo: "https://sandbox.asaas.com/i/pay_123"
    });
    expect(startCheckoutMock).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "pro",
        email: "maria@example.com",
        document: "12345678900"
      }),
      expect.objectContaining({
        requestId: "req_checkout_123"
      })
    );
  });

  it("propagates a correlation id from the request headers", async () => {
    startCheckoutMock.mockResolvedValueOnce({
      outcome: "payment_required",
      redirectTo: "https://sandbox.asaas.com/i/pay_123",
      subscription: {
        status: "PENDING",
        paymentStatus: "PENDING",
        checkoutUrl: "https://sandbox.asaas.com/i/pay_123"
      }
    });

    await POST(
      makeRequest(validPayload(), {
        "x-request-id": "req_checkout_123"
      })
    );

    expect(startCheckoutMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        requestId: "req_checkout_123"
      })
    );
  });

  it("returns 400 for an invalid plan", async () => {
    const response = await POST(makeRequest(validPayload({ plan: "enterprise" })));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Dados de checkout invalidos.");
    expect(startCheckoutMock).not.toHaveBeenCalled();
  });

  it("returns 400 for mismatched passwords", async () => {
    const response = await POST(
      makeRequest(validPayload({ password: "senha-segura", confirmPassword: "outra-senha" }))
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Dados de checkout invalidos.");
    expect(startCheckoutMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const response = await POST(makeRequest(validPayload({ email: "maria-invalido" })));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Dados de checkout invalidos.");
    expect(startCheckoutMock).not.toHaveBeenCalled();
  });

  it("returns a safe error when the asaas flow fails", async () => {
    startCheckoutMock.mockRejectedValueOnce(new Error("Nao foi possivel iniciar o checkout agora."));

    const response = await POST(makeRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toBe("Nao foi possivel iniciar o checkout agora.");
  });

  it("redirects active subscriptions to the dashboard", async () => {
    startCheckoutMock.mockResolvedValueOnce({
      outcome: "active_exists",
      redirectTo: "/dashboard",
      subscription: {
        status: "ACTIVE",
        paymentStatus: "RECEIVED",
        checkoutUrl: null
      }
    });

    const response = await POST(makeRequest(validPayload({ email: "ativo@example.com" })));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      checkoutUrl: null,
      subscriptionStatus: "ACTIVE",
      paymentStatus: "RECEIVED",
      redirectTo: "/dashboard"
    });
  });

  it("does not expose internal errors or sensitive values", async () => {
    startCheckoutMock.mockRejectedValueOnce(new Error("ASAAS_API_KEY ausente. stack trace interno"));

    const response = await POST(makeRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Falha inesperada ao iniciar checkout.");
    expect(JSON.stringify(payload)).not.toContain("ASAAS_API_KEY");
    expect(JSON.stringify(payload)).not.toContain("stack trace");
  });
});
