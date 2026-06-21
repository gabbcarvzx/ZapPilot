import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PricingPage from "../../app/pricing/page";
import SuccessPage from "../../app/success/page";

describe("public commercial pages", () => {
  it("renders pricing with the premium plan positioning", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Escolha o plano ideal");
    expect(markup).toContain("Plano recomendado");
    expect(markup).toContain("Comprar Pro");
    expect(markup).toContain("Cancele quando quiser");
    expect(markup).toContain('href="/checkout/pro"');
  });

  it("renders success page with premium guidance and dashboard CTA", async () => {
    const markup = renderToStaticMarkup(await SuccessPage({ searchParams: Promise.resolve({ status: "unknown" }) }));

    expect(markup).toContain("Nao conseguimos confirmar o status do pagamento agora");
    expect(markup).toContain("Voltar aos planos");
    expect(markup).toContain('href="/dashboard"');
    expect(markup).toContain('href="/pricing"');
  });
});
