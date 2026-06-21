import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAsaasSubscriptionCheckout,
  createOrUpdateAsaasCustomer
} from "../../lib/asaas";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init
  });
}

describe("asaas client", () => {
  const originalEnv = { ...process.env };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.ASAAS_API_KEY = "sandbox_key";
    process.env.ASAAS_ENV = "sandbox";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    delete process.env.ASAAS_SUCCESS_URL;

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("creates a customer successfully with the expected sandbox payload", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "cus_000005219613",
        name: "Maria Silva"
      })
    );

    const result = await createOrUpdateAsaasCustomer({
      name: "Maria Silva",
      email: "maria@example.com",
      mobilePhone: "11999999999",
      cpfCnpj: "12345678900",
      externalReference: "biz_123"
    });

    expect(result.id).toBe("cus_000005219613");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-sandbox.asaas.com/v3/customers",
      expect.objectContaining({
        method: "POST",
        cache: "no-store"
      })
    );

    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body as string)).toMatchObject({
      name: "Maria Silva",
      email: "maria@example.com",
      mobilePhone: "11999999999",
      cpfCnpj: "12345678900",
      externalReference: "biz_123"
    });
  });

  it("creates a subscription checkout successfully by fetching the generated payment", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: "sub_VXJBYgP2u0eO",
          customer: "cus_000005219613"
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "pay_123",
              status: "PENDING",
              invoiceUrl: "https://sandbox.asaas.com/i/pay_123"
            }
          ]
        })
      );

    const result = await createAsaasSubscriptionCheckout({
      customerId: "cus_000005219613",
      plan: {
        id: "plan_pro",
        code: "PRO",
        name: "Pro",
        priceCents: 9700,
        currency: "BRL",
        description: "Plano Pro",
        features: [],
        isActive: true
      },
      externalReference: "subscription:sub_local_123",
      email: "maria@example.com"
    });

    expect(result).toEqual({
      id: "sub_VXJBYgP2u0eO",
      paymentId: "pay_123",
      invoiceUrl: "https://sandbox.asaas.com/i/pay_123",
      status: "PENDING"
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api-sandbox.asaas.com/v3/subscriptions/sub_VXJBYgP2u0eO/payments",
      expect.objectContaining({
        cache: "no-store"
      })
    );
  });

  it("surfaces validation errors from asaas safely", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: [{ code: "invalid_customer", description: "Customer not found" }]
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" }
        }
      )
    );

    await expect(
      createOrUpdateAsaasCustomer({
        name: "Maria Silva",
        email: "maria@example.com",
        mobilePhone: "11999999999",
        cpfCnpj: "12345678900",
        externalReference: "biz_123"
      })
    ).rejects.toThrow("ASAAS request failed: 400");
  });

  it("fails clearly on authentication errors", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Unauthorized", {
        status: 401,
        headers: { "content-type": "text/plain" }
      })
    );

    await expect(
      createOrUpdateAsaasCustomer({
        name: "Maria Silva",
        email: "maria@example.com",
        mobilePhone: "11999999999",
        cpfCnpj: "12345678900",
        externalReference: "biz_123"
      })
    ).rejects.toThrow("ASAAS request failed: 401");
  });

  it("fails when the generated payment does not include a payment url", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: "sub_VXJBYgP2u0eO"
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "pay_123",
              status: "PENDING"
            }
          ]
        })
      );

    await expect(
      createAsaasSubscriptionCheckout({
        customerId: "cus_000005219613",
        plan: {
          id: "plan_pro",
          code: "PRO",
          name: "Pro",
          priceCents: 9700,
          currency: "BRL",
          description: "Plano Pro",
          features: [],
          isActive: true
        },
        externalReference: "subscription:sub_local_123",
        email: "maria@example.com"
      })
    ).rejects.toThrow("ASAAS subscription payment did not return a payment URL.");
  });

  it("normalizes unexpected payment statuses to pending", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: "sub_VXJBYgP2u0eO"
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "pay_123",
              status: "AWAITING_SETTLEMENT",
              invoiceUrl: "https://sandbox.asaas.com/i/pay_123"
            }
          ]
        })
      );

    const result = await createAsaasSubscriptionCheckout({
      customerId: "cus_000005219613",
      plan: {
        id: "plan_pro",
        code: "PRO",
        name: "Pro",
        priceCents: 9700,
        currency: "BRL",
        description: "Plano Pro",
        features: [],
        isActive: true
      },
      externalReference: "subscription:sub_local_123",
      email: "maria@example.com"
    });

    expect(result.status).toBe("PENDING");
  });

  it("fails in production when redirect urls are not configured", async () => {
    process.env.ASAAS_ENV = "production";
    process.env.NEXTAUTH_URL = "";
    process.env.ASAAS_SUCCESS_URL = "";

    await expect(
      createAsaasSubscriptionCheckout({
        customerId: "cus_000005219613",
        plan: {
          id: "plan_pro",
          code: "PRO",
          name: "Pro",
          priceCents: 9700,
          currency: "BRL",
          description: "Plano Pro",
          features: [],
          isActive: true
        },
        externalReference: "subscription:sub_local_123",
        email: "maria@example.com"
      })
    ).rejects.toThrow("Configure NEXTAUTH_URL ou ASAAS_SUCCESS_URL para producao.");
  });

  it("appends pending status to an explicit success url when production uses a clean path", async () => {
    process.env.ASAAS_ENV = "production";
    process.env.ASAAS_SUCCESS_URL = "https://zappilotchat.vercel.app/success";

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: "sub_VXJBYgP2u0eO"
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "pay_123",
              status: "PENDING",
              invoiceUrl: "https://asaas.com/i/pay_123"
            }
          ]
        })
      );

    await createAsaasSubscriptionCheckout({
      customerId: "cus_000005219613",
      plan: {
        id: "plan_pro",
        code: "PRO",
        name: "Pro",
        priceCents: 9700,
        currency: "BRL",
        description: "Plano Pro",
        features: [],
        isActive: true
      },
      externalReference: "subscription:sub_local_123",
      email: "maria@example.com"
    });

    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body as string)).toMatchObject({
      callback: {
        successUrl: "https://zappilotchat.vercel.app/success?status=pending",
        autoRedirect: true
      }
    });
  });
});
