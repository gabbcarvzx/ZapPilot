import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  delete process.env.AUTH_SECRET;
  delete process.env.NODE_ENV;
});

describe("auth secret resolution", () => {
  it("throws in production when AUTH_SECRET is missing", async () => {
    process.env.NODE_ENV = "production";

    const { resolveAuthSecret } = await import("../../lib/auth-secret");

    expect(() => resolveAuthSecret("")).toThrow(/AUTH_SECRET/i);
  });

  it("throws in production when the insecure fallback value is used", async () => {
    process.env.NODE_ENV = "production";

    const { resolveAuthSecret } = await import("../../lib/auth-secret");

    expect(() => resolveAuthSecret("dev-only-insecure-secret")).toThrow(/AUTH_SECRET/i);
  });

  it("keeps the local fallback only outside production", async () => {
    process.env.NODE_ENV = "development";

    const { resolveAuthSecret } = await import("../../lib/auth-secret");

    expect(resolveAuthSecret("")).toBe("dev-only-insecure-secret");
  });
});
