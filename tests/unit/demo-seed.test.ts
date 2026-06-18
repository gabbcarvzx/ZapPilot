import { describe, expect, it } from "vitest";

import { DEMO_SEED_TENANTS } from "../../prisma/demo-seed";

describe("demo seed catalog", () => {
  it("defines the three commercial demo tenants required by the activation plan", () => {
    expect(DEMO_SEED_TENANTS).toHaveLength(3);
    expect(DEMO_SEED_TENANTS.map((tenant) => tenant.business.niche)).toEqual([
      "Hamburgueria",
      "Barbearia",
      "Loja de roupas"
    ]);
  });

  it("keeps every tenant commercially activatable with active subscription and mock-safe WhatsApp", () => {
    for (const tenant of DEMO_SEED_TENANTS) {
      expect(tenant.subscription.status).toBe("ACTIVE");
      expect(tenant.whatsappConfig.webhookStatus).toBe("mock");
      expect(tenant.whatsappConfig.isActive).toBe(false);
      expect(tenant.whatsappConfig.verifyToken).toBe("");
      expect(tenant.whatsappConfig.accessToken).toBe("");
    }
  });

  it("includes enough demo content for a sales call", () => {
    for (const tenant of DEMO_SEED_TENANTS) {
      expect(tenant.products.length).toBeGreaterThan(0);
      expect(tenant.faqs.length).toBeGreaterThan(0);
      expect(tenant.conversations.length).toBeGreaterThan(0);
      expect(tenant.conversations.some((conversation) => conversation.messages.length > 0)).toBe(true);
    }
  });
});
