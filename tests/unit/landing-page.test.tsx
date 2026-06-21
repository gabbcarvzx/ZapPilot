import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HomePage from "../../app/page";
import { metadata } from "../../app/layout";

describe("landing page commercial experience", () => {
  it("renders the premium commercial copy and primary CTAs", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Automatize atendimentos, responda clientes e venda mais pelo WhatsApp.");
    expect(markup).toContain("O ZapPilot transforma o WhatsApp do seu negocio em um atendente automatico");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain("Comecar agora");
    expect(markup).toContain('href="/login"');
    expect(markup).toContain("Entrar no painel");
  });

  it("renders trust signals, visual mockup and premium proof points", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Pagamento seguro");
    expect(markup).toContain("Configuracao assistida");
    expect(markup).toContain("Visao da conversa automatizada");
    expect(markup).toContain("Pagamento seguro via ASAAS");
    expect(markup).toContain("SaaS para atendimento comercial no WhatsApp");
    expect(markup).toContain("Seu atendimento pode parecer mais profissional antes mesmo da primeira integracao real.");
  });

  it("uses the updated metadata in commercial Portuguese", () => {
    expect(metadata.title).toBe("ZapPilot | Atendente automatico para WhatsApp");
    expect(metadata.description).toBe(
      "Automatize atendimentos, responda clientes e venda mais pelo WhatsApp com uma operacao comercial mais organizada."
    );
  });
});
