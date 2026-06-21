import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("../../components/forms/checkout-form", () => ({
  CheckoutForm: ({ plan, mode }: { plan: string; mode?: string }) => (
    <div data-checkout-form={`${plan}:${mode ?? "checkout"}`}>Checkout form</div>
  )
}));

import SignUpPage from "../../app/signup/page";

describe("signup page", () => {
  it("renders the selected plan summary and integrated checkout form", async () => {
    const markup = renderToStaticMarkup(
      await SignUpPage({
        searchParams: Promise.resolve({ plan: "pro" })
      })
    );

    expect(markup).toContain("Cadastro integrado ao plano");
    expect(markup).toContain("Pro");
    expect(markup).toContain("97,00");
    expect(markup).toContain("Ate 2.500 mensagens por mes");
    expect(markup).toContain('data-checkout-form="pro:signup"');
  });

  it("shows a safe fallback when the plan is invalid", async () => {
    const markup = renderToStaticMarkup(
      await SignUpPage({
        searchParams: Promise.resolve({ plan: "enterprise" })
      })
    );

    expect(markup).toContain("Plano invalido");
    expect(markup).toContain('href="/pricing"');
  });
});
