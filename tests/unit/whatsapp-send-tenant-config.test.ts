import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tenant-aware WhatsApp send", () => {
  it("uses tenant credentials when they are provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid.123" }] })
    });

    const { sendWhatsAppMessage } = await import("../../lib/whatsapp");

    await sendWhatsAppMessage({
      phone: "5511999990000",
      content: "Teste",
      credentials: {
        accessToken: "tenant-token",
        phoneNumberId: "tenant-phone-id"
      }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v20.0/tenant-phone-id/messages",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer tenant-token"
        })
      })
    );
  });
});
