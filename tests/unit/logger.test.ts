import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-21T18:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("structured logger", () => {
  it("writes sanitized structured logs without sensitive fields", async () => {
    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const { logInfo } = await import("../../lib/logger");

    logInfo("whatsapp.send.completed", {
      businessId: "biz_123",
      userId: "user_123",
      metadata: {
        accessToken: "secret",
        verifyToken: "hidden",
        document: "12345678900",
        cardNumber: "4111111111111111",
        phone: "5511999990000",
        nested: {
          authorization: "Bearer token",
          cpfCnpj: "12345678900",
          attempt: 1
        }
      },
      requestId: "req_123"
    });

    expect(logSpy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(logSpy.mock.calls[0]?.[0] as string);
    expect(payload).toEqual({
      timestamp: "2026-06-21T18:00:00.000Z",
      level: "info",
      event: "whatsapp.send.completed",
      businessId: "biz_123",
      userId: "user_123",
      requestId: "req_123",
      metadata: {
        accessToken: "[REDACTED]",
        verifyToken: "[REDACTED]",
        document: "[REDACTED]",
        cardNumber: "[REDACTED]",
        phone: "5511999990000",
        nested: {
          authorization: "[REDACTED]",
          cpfCnpj: "[REDACTED]",
          attempt: 1
        }
      }
    });
  });
});
