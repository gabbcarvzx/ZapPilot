/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const assignMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn()
  })
}));

import { CheckoutForm } from "../../components/forms/checkout-form";

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Maria Silva" } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "maria@example.com" } });
  fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "11999999999" } });
  fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "12345678900" } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "senha-segura" } });
}

describe("checkout form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    pushMock.mockReset();
    assignMock.mockReset();
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(window, "location", {
      value: {
        assign: assignMock
      },
      writable: true
    });
  });

  it("marks required checkout fields", () => {
    render(<CheckoutForm plan="pro" />);

    expect(screen.getByLabelText("Nome completo").getAttribute("required")).not.toBeNull();
    expect(screen.getByLabelText("E-mail").getAttribute("required")).not.toBeNull();
    expect(screen.getByLabelText("Telefone").getAttribute("required")).not.toBeNull();
    expect(screen.getByLabelText("CPF ou CNPJ").getAttribute("required")).not.toBeNull();
    expect(screen.getByLabelText("Senha").getAttribute("required")).not.toBeNull();
    expect(screen.getByLabelText("Confirmar senha").getAttribute("required")).not.toBeNull();
  });

  it("blocks submit when passwords do not match", async () => {
    render(<CheckoutForm plan="pro" />);

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Maria Silva" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "maria@example.com" } });
    fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "11999999999" } });
    fireEvent.change(screen.getByLabelText("CPF ou CNPJ"), { target: { value: "12345678900" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-segura" } });
    fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "senha-diferente" } });

    fireEvent.submit(screen.getByRole("button", { name: "Ir para pagamento seguro" }).closest("form")!);

    await screen.findByText("As senhas nao coincidem.");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("redirects to the asaas checkout when checkoutUrl is returned", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          checkoutUrl: "https://sandbox.asaas.com/i/pay_123",
          redirectTo: "https://sandbox.asaas.com/i/pay_123",
          subscriptionStatus: "PENDING",
          paymentStatus: "PENDING"
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    render(<CheckoutForm plan="pro" />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: "Ir para pagamento seguro" }).closest("form")!);

    await waitFor(() => expect(assignMock).toHaveBeenCalledWith("https://sandbox.asaas.com/i/pay_123"));
  });

  it("redirects with router when redirectTo is returned", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          checkoutUrl: null,
          redirectTo: "/dashboard",
          subscriptionStatus: "ACTIVE",
          paymentStatus: "RECEIVED"
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    render(<CheckoutForm plan="pro" />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: "Ir para pagamento seguro" }).closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows a safe API error message", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Nao foi possivel iniciar o checkout agora." }), {
        status: 502,
        headers: { "content-type": "application/json" }
      })
    );

    render(<CheckoutForm plan="pro" />);
    fillRequiredFields();

    fireEvent.submit(screen.getByRole("button", { name: "Ir para pagamento seguro" }).closest("form")!);

    await screen.findByText("Nao foi possivel iniciar o checkout agora.");
    expect(assignMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
