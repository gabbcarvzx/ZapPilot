import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("WhatsApp webhook tenant resolution", () => {
  it("routes inbound messages to the tenant resolved by phone_number_id", async () => {
    const receiveInboundMessage = vi.fn().mockResolvedValue({
      status: "answered",
      conversationId: "conv_123",
      reply: "ok"
    });
    const resolveBusinessIdByPhoneNumberId = vi.fn().mockResolvedValue("biz_tenant_a");

    vi.doMock("../../server/services/whatsapp-service", () => ({
      receiveInboundMessage
    }));

    vi.doMock("../../server/services/business-service", () => ({
      resolveBusinessIdByPhoneNumberId
    }));

    const { POST } = await import("../../app/api/webhook/whatsapp/route");

    const response = await POST(
      new Request("http://localhost:3000/api/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    metadata: {
                      phone_number_id: "phone_123"
                    },
                    contacts: [{ profile: { name: "Lead A" } }],
                    messages: [{ from: "5511999990000", text: { body: "Oi" } }]
                  }
                }
              ]
            }
          ]
        })
      })
    );

    expect(response.status).toBe(200);
    expect(resolveBusinessIdByPhoneNumberId).toHaveBeenCalledWith("phone_123");
    expect(receiveInboundMessage).toHaveBeenCalledWith("biz_tenant_a", "5511999990000", "Lead A", "Oi");
  });

  it("rejects inbound messages when no tenant matches the phone_number_id", async () => {
    const receiveInboundMessage = vi.fn();
    const resolveBusinessIdByPhoneNumberId = vi.fn().mockResolvedValue(null);

    vi.doMock("../../server/services/whatsapp-service", () => ({
      receiveInboundMessage
    }));

    vi.doMock("../../server/services/business-service", () => ({
      resolveBusinessIdByPhoneNumberId
    }));

    const { POST } = await import("../../app/api/webhook/whatsapp/route");

    const response = await POST(
      new Request("http://localhost:3000/api/webhook/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    metadata: {
                      phone_number_id: "unknown_phone"
                    },
                    contacts: [{ profile: { name: "Lead B" } }],
                    messages: [{ from: "5511999991111", text: { body: "Oi" } }]
                  }
                }
              ]
            }
          ]
        })
      })
    );

    expect(response.status).toBe(404);
    expect(receiveInboundMessage).not.toHaveBeenCalled();
  });
});
