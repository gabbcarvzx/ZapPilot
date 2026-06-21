import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("simulate message route", () => {
  it("returns the inactive plan result instead of bypassing commercial gating", async () => {
    const receiveInboundMessage = vi.fn().mockResolvedValue({
      status: "inactive_plan",
      conversationId: "conv_pending"
    });
    const buildAssistantReply = vi.fn();

    vi.doMock("../../server/services/whatsapp-service", () => ({
      receiveInboundMessage
    }));

    vi.doMock("../../server/services/assistant-service", () => ({
      buildAssistantReply
    }));

    const { POST } = await import("../../app/api/dev/simulate-message/route");

    const response = await POST(
      new Request("http://localhost:3000/api/dev/simulate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "biz_pending",
          phone: "5511999990000",
          contactName: "Lead Local",
          content: "Oi"
        })
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      status: "inactive_plan",
      conversationId: "conv_pending"
    });
    expect(buildAssistantReply).not.toHaveBeenCalled();
  });
});
