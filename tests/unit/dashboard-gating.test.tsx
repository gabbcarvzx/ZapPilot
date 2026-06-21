import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getSubscriptionForBusinessMock, getAllBusinessesWithSubscriptionsMock } = vi.hoisted(() => ({
  getSubscriptionForBusinessMock: vi.fn(),
  getAllBusinessesWithSubscriptionsMock: vi.fn()
}));

vi.mock("../../components/forms/business-settings-form", () => ({
  BusinessSettingsForm: () => <div>Business settings form</div>
}));

vi.mock("../../components/dashboard/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("../../components/dashboard/diagnostic-summary", () => ({
  DiagnosticSummary: () => <div>Diagnostic summary</div>
}));

vi.mock("../../components/forms/assistant-form", () => ({
  AssistantForm: () => <div>Assistant form</div>
}));

vi.mock("../../components/forms/whatsapp-settings-form", () => ({
  WhatsAppSettingsForm: ({
    canActivateReal,
    activationBlockedReason
  }: {
    canActivateReal?: boolean;
    activationBlockedReason?: string;
  }) => (
    <div>
      <span>{canActivateReal ? "real-active-allowed" : "real-active-blocked"}</span>
      {activationBlockedReason ? <span>{activationBlockedReason}</span> : null}
    </div>
  )
}));

vi.mock("../../lib/guards", () => ({
  requireUser: vi.fn(async () => ({
    id: "user_1",
    name: "Maria",
    businessId: "biz_1",
    role: "CUSTOMER"
  })),
  requireAdmin: vi.fn(async () => ({
    id: "admin_1",
    name: "Admin",
    businessId: "biz_admin",
    role: "ADMIN"
  }))
}));

vi.mock("../../server/services/business-service", () => ({
  getBusinessSnapshot: vi.fn(async () => ({
    id: "biz_1",
    name: "ZapBurger Centro",
    niche: "Hamburgueria",
    address: "",
    phone: "11999999999",
    whatsappNumber: "11999999999",
    businessHours: "",
    welcomeMessage: "Ola",
    closedMessage: "Fechado",
    tone: "Profissional",
    isOnboardingComplete: false,
    products: [],
    faqs: [],
    whatsappConfig: {
      isActive: true,
      metaBusinessAccountId: "waba_1",
      metaPhoneNumberId: "phone_1",
      metaAppId: "app_1",
      verifyToken: "verify",
      accessToken: "token"
    }
  }))
}));

vi.mock("../../server/services/message-service", () => ({
  listMessagesForBusiness: vi.fn(async () => [])
}));

vi.mock("../../server/services/integrations-service", () => ({
  getIntegrationStatuses: vi.fn(() => []),
  getTenantDiagnosticSummary: vi.fn()
}));

vi.mock("../../server/services/operational-diagnostics-service", () => ({
  getTenantOperationalDiagnostics: vi.fn(({ subscriptionStatus }: { subscriptionStatus?: string }) => ({
    readiness: {
      status: subscriptionStatus === "ACTIVE" ? "ready" : "blocked",
      reason:
        subscriptionStatus === "ACTIVE"
          ? "Empresa pronta para responder em operacao."
          : "Conta criada, pagamento pendente e automacao bloqueada."
    },
    plan: {
      status: subscriptionStatus === "ACTIVE" ? "healthy" : "blocked",
      label: subscriptionStatus === "ACTIVE" ? "Ativo" : "Pendente",
      detail:
        subscriptionStatus === "ACTIVE"
          ? "Plano liberado para atendimento e testes em producao."
          : "Conta criada, pagamento pendente e automacao bloqueada.",
      mode: subscriptionStatus === "ACTIVE" ? "Live" : "Mock"
    },
    whatsapp: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
    ai: { status: "healthy", label: "Ativa", detail: "OK", mode: "Live" },
    auth: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
    database: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
    webhook: { status: "healthy", label: "Verificado", detail: "OK", mode: "Live" },
    billing: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" }
  })),
  getAdminOperationalSummary: vi.fn(async () => ({
    system: {
      app: { status: "healthy", detail: "App OK" },
      database: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
      auth: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
      gemini: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
      whatsapp: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
      billing: { status: "healthy", label: "Ativo", detail: "OK", mode: "Live" },
      timestamp: "2026-06-21T00:00:00.000Z",
      secretsExposed: false
    },
    commercial: {
      active: 1,
      pending: 0,
      expired: 0,
      trial: 0,
      estimatedRevenueCents: 9700,
      planDistribution: [{ planName: "Pro", count: 1 }]
    },
    tenants: {
      total: 1,
      ready: 0,
      incompleteConfig: 1,
      usingMock: 0,
      withoutWhatsApp: 0
    },
    tenantSummaries: []
  }))
}));

vi.mock("../../server/services/subscription-service", async () => {
  const actual = await vi.importActual("../../server/services/subscription-service");

  return {
    ...(actual as object),
    getSubscriptionForBusiness: getSubscriptionForBusinessMock,
    getAllBusinessesWithSubscriptions: getAllBusinessesWithSubscriptionsMock,
    updateSubscription: vi.fn()
  };
});

import DashboardPage from "../../app/(app)/dashboard/page";
import OnboardingPage from "../../app/(app)/onboarding/page";
import AdminPage from "../../app/admin/page";

describe("commercial gating", () => {
  it("dashboard pending shows commercial block and payment guidance", async () => {
    getSubscriptionForBusinessMock.mockResolvedValueOnce({
      status: "PENDING",
      paymentStatus: "PENDING",
      checkoutUrl: "https://sandbox.asaas.com/i/pay_123",
      plan: { name: "Pro" }
    });

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("Plano pendente de ativacao");
    expect(markup).toContain("Pendente");
    expect(markup).toContain('href="https://sandbox.asaas.com/i/pay_123"');
  });

  it("dashboard active shows release state", async () => {
    getSubscriptionForBusinessMock.mockResolvedValueOnce({
      status: "ACTIVE",
      paymentStatus: "RECEIVED",
      checkoutUrl: null,
      plan: { name: "Pro" }
    });

    const markup = renderToStaticMarkup(await DashboardPage());

    expect(markup).toContain("Pronto para teste real");
    expect(markup).toContain("Ativo");
    expect(markup).not.toContain("Pagamento pendente");
  });

  it("onboarding keeps setup available but blocks real activation for pending plans", async () => {
    getSubscriptionForBusinessMock.mockResolvedValueOnce({
      status: "PENDING",
      paymentStatus: "PENDING",
      checkoutUrl: null,
      plan: { name: "Pro" }
    });

    const markup = renderToStaticMarkup(await OnboardingPage());

    expect(markup).toContain("Conta criada, pagamento pendente e automacao bloqueada ate a confirmacao do plano.");
    expect(markup).toContain("real-active-blocked");
  });

  it("admin shows plan status, payment status and automation release state", async () => {
    getAllBusinessesWithSubscriptionsMock.mockResolvedValueOnce([
      {
        id: "biz_1",
        name: "ZapBurger Centro",
        owner: { email: "maria@example.com" },
        whatsappConfig: { isActive: true },
        subscriptions: [
          {
            id: "sub_1",
            status: "PENDING",
            paymentStatus: "PENDING",
            planId: "plan_pro",
            plan: { name: "Pro" }
          }
        ]
      }
    ]);

    const markup = renderToStaticMarkup(await AdminPage());

    expect(markup).toContain("Pagamento");
    expect(markup).toContain("Operacao");
    expect(markup).toContain("Pendente");
    expect(markup).toContain("Plano pendente de ativacao");
  });
});
