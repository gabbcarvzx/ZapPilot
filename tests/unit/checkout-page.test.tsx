import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../../components/forms/checkout-form", () => ({
  CheckoutForm: ({ plan }: { plan: string }) => <div data-checkout-form={plan}>Checkout form</div>
}));

import CheckoutPage from "../../app/checkout/[plan]/page";

describe("checkout page", () => {
  it("renders a valid plan with monthly price, benefits and secure payment copy", async () => {
    const markup = renderToStaticMarkup(
      await CheckoutPage({
        params: Promise.resolve({ plan: "pro" })
      })
    );

    expect(markup).toContain("Pro");
    expect(markup).toContain("/mes");
    expect(markup).toContain("Pagamento seguro via ASAAS");
    expect(markup).toContain("IA com Gemini");
  });

  it("shows a safe invalid-plan state for unsupported slugs", async () => {
    const markup = renderToStaticMarkup(
      await CheckoutPage({
        params: Promise.resolve({ plan: "enterprise" })
      })
    );

    expect(markup).toContain("Plano indisponivel");
    expect(markup).toContain('href="/pricing"');
  });
});
