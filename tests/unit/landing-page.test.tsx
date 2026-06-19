import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import HomePage from "../../app/page";
import { metadata } from "../../app/layout";

describe("landing page commercial experience", () => {
  it("renders the updated commercial copy and conversion CTAs", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Seu WhatsApp atendendo clientes e gerando vendas, mesmo quando você está ocupado.");
    expect(markup).toContain("O ZapPilot ajuda comércios locais a responder clientes mais rápido, organizar pedidos e não perder oportunidades no WhatsApp.");
    expect(markup).toContain('href="/signup"');
    expect(markup).toContain("Quero atender melhor");
    expect(markup).toContain('href="#demonstracao"');
    expect(markup).toContain("Ver demonstração");
  });

  it("renders the refreshed demo card, trust signals and metrics", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("Pronto para demonstração");
    expect(markup).toContain("Configuração assistida");
    expect(markup).toContain("Sem complicação técnica para o cliente");
    expect(markup).toContain("1ª resposta");
    expect(markup).toContain("3x mais clareza");
    expect(markup).toContain("24h organizado");
    expect(markup).toContain("Oi, queria saber o preço da pizza grande e se vocês entregam.");
    expect(markup).toContain("Claro! A pizza grande sai a partir de R$54,90.");
  });

  it("uses the updated metadata in commercial Portuguese", () => {
    expect(metadata.title).toBe("ZapPilot | Atendente automático para WhatsApp");
    expect(metadata.description).toBe(
      "Atenda clientes, organize pedidos e venda melhor pelo WhatsApp com um atendente automático feito para comércios locais."
    );
  });
});
