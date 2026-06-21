import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PricingPage from "../../app/pricing/page";
import SuccessPage from "../../app/success/page";

describe("public commercial pages", () => {
  it("renders pricing with the premium plan positioning", () => {
    const markup = renderToStaticMarkup(<PricingPage />);

    expect(markup).toContain("Escolha o plano ideal");
    expect(markup).toContain("Mais popular");
    expect(markup).toContain("Comecar com o Pro");
    expect(markup).toContain("Cancele quando quiser");
    expect(markup).toContain('href="/signup"');
  });

  it("renders success page with premium guidance and dashboard CTA", () => {
    const markup = renderToStaticMarkup(<SuccessPage />);

    expect(markup).toContain("Recebemos sua solicitacao com sucesso");
    expect(markup).toContain("Conta pronta para continuar");
    expect(markup).toContain("Ativacao acompanhada");
    expect(markup).toContain('href="/dashboard"');
    expect(markup).toContain('href="/pricing"');
  });
});
