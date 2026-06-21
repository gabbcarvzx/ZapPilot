import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import SuccessPage from "../../app/success/page";

describe("success page", () => {
  it("renders the pending payment state", async () => {
    const markup = renderToStaticMarkup(
      await SuccessPage({
        searchParams: Promise.resolve({ status: "pending" })
      })
    );

    expect(markup).toContain("Pagamento em analise");
    expect(markup).toContain("A confirmacao pode levar alguns instantes");
    expect(markup).toContain("Ir para o dashboard");
    expect(markup).toContain("A automacao real sera liberada apos a confirmacao");
  });

  it("renders the active subscription state", async () => {
    const markup = renderToStaticMarkup(
      await SuccessPage({
        searchParams: Promise.resolve({ status: "active" })
      })
    );

    expect(markup).toContain("Assinatura ativa");
    expect(markup).toContain("Empresa");
    expect(markup).toContain("Produtos");
    expect(markup).toContain("WhatsApp");
    expect(markup).toContain("Teste do assistente");
    expect(markup).toContain("Ir para o dashboard");
  });

  it("shows a safe fallback state with links to plans and dashboard", async () => {
    const markup = renderToStaticMarkup(
      await SuccessPage({
        searchParams: Promise.resolve({ status: "unknown" })
      })
    );

    expect(markup).toContain("Nao conseguimos confirmar o status do pagamento agora");
    expect(markup).toContain('href="/pricing"');
    expect(markup).toContain('href="/dashboard"');
  });

  it("does not expose technical ids or stack traces", async () => {
    const markup = renderToStaticMarkup(
      await SuccessPage({
        searchParams: Promise.resolve({
          status: "pending",
          subscriptionId: "sub_internal_123",
          paymentId: "pay_123"
        } as Record<string, string>)
      })
    );

    expect(markup).not.toContain("sub_internal_123");
    expect(markup).not.toContain("pay_123");
    expect(markup).not.toContain("stack");
  });
});
