import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import PricingPage from "../../app/pricing/page";

describe("pricing page checkout links", () => {
  it("renders the three public plans and sends each CTA to signup with the selected plan", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Starter");
    expect(markup).toContain("Pro");
    expect(markup).toContain("Business");

    expect(markup).toContain('href="/signup?plan=start"');
    expect(markup).toContain('href="/signup?plan=pro"');
    expect(markup).toContain('href="/signup?plan=premium"');
    expect(markup).toContain("Comecar agora");
  });

  it("renders social proof, faq and the mobile conversion CTA", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("FAQ comercial");
    expect(markup).toContain("O plano Pro virou a rota principal de conversao.");
    expect(markup).toContain("Comecar agora no plano Pro");
  });

  it("highlights Pro as the recommended plan and removes the old direct checkout links", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Plano recomendado");
    expect(markup).not.toContain('href="/checkout/start"');
    expect(markup).not.toContain('href="/checkout/pro"');
    expect(markup).not.toContain('href="/checkout/premium"');
  });
});
