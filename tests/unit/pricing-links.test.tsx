import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import PricingPage from "../../app/pricing/page";

describe("pricing page checkout links", () => {
  it("renders the three public plans and sends each CTA to the real checkout flow", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Start");
    expect(markup).toContain("Pro");
    expect(markup).toContain("Premium");

    expect(markup).toContain('href="/checkout/start"');
    expect(markup).toContain("Comprar Start");

    expect(markup).toContain('href="/checkout/pro"');
    expect(markup).toContain("Comprar Pro");

    expect(markup).toContain('href="/checkout/premium"');
    expect(markup).toContain("Comprar Premium");
  });

  it("highlights Pro as the recommended plan and removes generic purchase CTAs to signup", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Plano recomendado");
    expect(markup).not.toContain('href="/signup"');
    expect(markup).not.toContain("Quero este plano");
    expect(markup).not.toContain("Comecar por aqui");
  });
});
