import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, sendWhatsAppMessageMock, createOutboundMessageMock, getSubscriptionForBusinessMock, guardPaidFeatureAccessMock } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    sendWhatsAppMessageMock: vi.fn(),
    createOutboundMessageMock: vi.fn(),
    getSubscriptionForBusinessMock: vi.fn(),
    guardPaidFeatureAccessMock: vi.fn()
  })
);

vi.mock("../../lib/auth", () => ({
  auth: authMock
}));

vi.mock("../../lib/whatsapp", () => ({
  sendWhatsAppMessage: sendWhatsAppMessageMock
}));

vi.mock("../../server/services/message-service", () => ({
  createOutboundMessage: createOutboundMessageMock
}));

vi.mock("../../server/services/subscription-service", () => ({
  getSubscriptionForBusiness: getSubscriptionForBusinessMock
}));

vi.mock("../../server/guards/paid-feature-guard", () => ({
  guardPaidFeatureAccess: guardPaidFeatureAccessMock
}));

import { POST } from "../../app/api/whatsapp/send/route";

describe("whatsapp send guard", () => {
  beforeEach(() => {
    authMock.mockReset();
    sendWhatsAppMessageMock.mockReset();
    createOutboundMessageMock.mockReset();
    getSubscriptionForBusinessMock.mockReset();
    guardPaidFeatureAccessMock.mockReset();
  });

  it("does not release real automation for pending subscriptions", async () => {
    authMock.mockResolvedValueOnce({
      user: {
        businessId: "biz_1"
      }
    });
    getSubscriptionForBusinessMock.mockResolvedValueOnce({
      status: "PENDING"
    });
    guardPaidFeatureAccessMock.mockReturnValueOnce({
      ok: false,
      httpStatus: 402,
      message: "O envio real fica disponivel somente apos a confirmacao do pagamento."
    });

    const response = await POST(
      new Request("http://localhost:3000/api/whatsapp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: "5511999999999",
          content: "teste"
        })
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(402);
    expect(payload.error).toContain("pagamento");
    expect(guardPaidFeatureAccessMock).toHaveBeenCalledWith({
      subscriptionStatus: "PENDING",
      resource: "real_whatsapp_send"
    });
    expect(sendWhatsAppMessageMock).not.toHaveBeenCalled();
    expect(createOutboundMessageMock).not.toHaveBeenCalled();
  });

  it("does not expose technical details when the plan expired", async () => {
    authMock.mockResolvedValueOnce({
      user: {
        businessId: "biz_1"
      }
    });
    getSubscriptionForBusinessMock.mockResolvedValueOnce({
      status: "EXPIRED"
    });
    guardPaidFeatureAccessMock.mockReturnValueOnce({
      ok: false,
      httpStatus: 402,
      message: "O envio real fica bloqueado porque o plano expirou e precisa ser regularizado."
    });

    const response = await POST(
      new Request("http://localhost:3000/api/whatsapp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone: "5511999999999",
          content: "teste"
        })
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(402);
    expect(payload.error).toContain("plano expirou");
    expect(payload.error).not.toContain("stack");
    expect(payload.error).not.toContain("asaas");
  });
});
