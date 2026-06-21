import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("createAccount transaction safety", () => {
  it("uses a prisma transaction for initial tenant creation", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: "user_123" })
      .mockResolvedValueOnce({ id: "biz_123" })
      .mockResolvedValueOnce({ id: "sub_123" })
      .mockResolvedValueOnce({ id: "wa_123" });

    const transactionClient = {
      user: { create },
      business: { create },
      subscription: { create },
      whatsAppConfig: { create }
    };

    const prismaMock = {
      $transaction: vi.fn(async (callback: (tx: typeof transactionClient) => Promise<unknown>) => callback(transactionClient))
    };

    vi.doMock("../../lib/prisma", () => ({
      prisma: prismaMock
    }));

    const { createAccount } = await import("../../server/services/business-service");

    await createAccount({
      name: "Tenant Owner",
      email: "owner@example.com",
      password: "supersecret",
      businessName: "Tenant Biz",
      niche: "Clinica"
    });

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(4);
  });
});
