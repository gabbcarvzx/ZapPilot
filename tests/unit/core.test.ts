import { beforeEach, describe, expect, it, vi } from "vitest";

describe("integration fallbacks", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    delete process.env.ADMIN_EMAILS;
  });

  it("uses simulated modes when secrets are absent", async () => {
    const { getIntegrationStatuses } = await import("../../server/services/integrations-service");
    const statuses = getIntegrationStatuses();

    expect(statuses.find((item) => item.name === "IA de atendimento")?.mode).toBe("Simulado");
    expect(statuses.find((item) => item.name === "Conexao WhatsApp")?.mode).toBe("Simulado");
  });

  it("returns deterministic mock Gemini response", async () => {
    const { generateBusinessReply } = await import("../../lib/gemini");
    const response = await generateBusinessReply({
      businessName: "ZapBurger",
      niche: "Hamburgueria",
      businessHours: "18h às 23h",
      products: [{ name: "Combo Smash", description: "Burger e fritas", price: "39,90" }],
      faqs: [],
      tone: "Direto",
      welcomeMessage: "Olá",
      closedMessage: "Fechado",
      latestCustomerMessage: "Qual o preço?"
    });

    expect(response).toContain("39,90");
  });

  it("simulates WhatsApp send when credentials are absent", async () => {
    const { sendWhatsAppMessage } = await import("../../lib/whatsapp");
    const result = await sendWhatsAppMessage({
      phone: "5511999990000",
      content: "Teste"
    });

    expect(result.mode).toBe("mock");
    expect(result.ok).toBe(true);
  });

  it("accepts local webhook verification without token in mock mode", async () => {
    const { GET } = await import("../../app/api/webhook/whatsapp/route");
    const response = await GET(new Request("http://localhost:3000/api/webhook/whatsapp?hub.challenge=123"));

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("123");
  });
});
