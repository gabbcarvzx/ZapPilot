import { mockStore } from "@/lib/mock-store";
import { PLAN_CATALOG } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getPaidFeaturePolicy } from "@/server/policies/paid-feature-policy";
import { subscriptionUpdateSchema } from "@/server/validators/admin";
import { type PaymentStatus, type PlanRecord, type SubscriptionRecord, type SubscriptionStatus } from "@/types/domain";

type ActivationGuidanceTone = "success" | "warning" | "danger";

interface ActivationGuidanceInput {
  subscriptionStatus: SubscriptionStatus | null | undefined;
  whatsappActive: boolean;
  readinessStatus: "ready" | "blocked";
}

interface ActivationGuidance {
  tone: ActivationGuidanceTone;
  title: string;
  detail: string;
  nextStep: string;
}

export interface SubscriptionSummary extends Omit<SubscriptionRecord, "status" | "paymentStatus"> {
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus | null;
  plan: PlanRecord | null;
}

function normalizePlanRecord(
  planId: string,
  plan:
    | PlanRecord
    | {
        id: string;
        code: string;
        name: string;
        priceCents: number;
        currency: string;
        description: string;
        isActive: boolean;
        features?: string[];
        featuresJson?: string;
      }
    | null
    | undefined
): PlanRecord | null {
  if (plan && "features" in plan && Array.isArray(plan.features)) {
    return {
      id: plan.id,
      code: plan.code as PlanRecord["code"],
      name: plan.name,
      priceCents: plan.priceCents,
      currency: plan.currency,
      description: plan.description,
      features: plan.features,
      isActive: plan.isActive
    };
  }

  if (plan && "featuresJson" in plan && typeof plan.featuresJson === "string") {
    let features: string[] = [];

    try {
      const parsed = JSON.parse(plan.featuresJson);
      features = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      features = [];
    }

    return {
      id: plan.id,
      code: plan.code as PlanRecord["code"],
      name: plan.name,
      priceCents: plan.priceCents,
      currency: plan.currency,
      description: plan.description,
      features,
      isActive: plan.isActive
    };
  }

  return PLAN_CATALOG.find((item) => item.id === planId) ?? null;
}

function normalizeSubscriptionSummary(
  subscription:
    | (SubscriptionRecord & {
        plan?: PlanRecord | null;
      })
    | {
        id: string;
        businessId: string;
        planId: string;
        status: SubscriptionStatus;
        asaasCustomerId: string | null;
        asaasSubscriptionId: string | null;
        asaasPaymentId: string | null;
        checkoutUrl: string | null;
        paymentStatus: PaymentStatus | null;
        paidAt: Date | string | null;
        currentPeriodStart: Date | string | null;
        currentPeriodEnd: Date | string | null;
        activatedAt: Date | string | null;
        canceledAt: Date | string | null;
        externalReference: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        plan?:
          | PlanRecord
          | {
              id: string;
              code: string;
              name: string;
              priceCents: number;
              currency: string;
              description: string;
              isActive: boolean;
              features?: string[];
              featuresJson?: string;
            }
          | null;
      }
): SubscriptionSummary {
  return {
    ...subscription,
    paidAt: subscription.paidAt ? String(subscription.paidAt) : null,
    currentPeriodStart: subscription.currentPeriodStart ? String(subscription.currentPeriodStart) : null,
    currentPeriodEnd: subscription.currentPeriodEnd ? String(subscription.currentPeriodEnd) : null,
    activatedAt: subscription.activatedAt ? String(subscription.activatedAt) : null,
    canceledAt: subscription.canceledAt ? String(subscription.canceledAt) : null,
    createdAt: String(subscription.createdAt),
    updatedAt: String(subscription.updatedAt),
    plan: normalizePlanRecord(subscription.planId, subscription.plan)
  };
}

export function getActivationGuidance(input: ActivationGuidanceInput): ActivationGuidance {
  const paidFeaturePolicy = getPaidFeaturePolicy(input.subscriptionStatus);

  if (paidFeaturePolicy.subscriptionStatus === "ACTIVE" && input.readinessStatus === "ready") {
    return {
      tone: "success",
      title: "Pronto para teste real",
      detail: "Plano ativo e base operacional suficiente para validar a empresa com mensagens reais.",
      nextStep: "Executar teste no WhatsApp do cliente e confirmar resposta ponta a ponta."
    };
  }

  if (paidFeaturePolicy.subscriptionStatus === "ACTIVE") {
    return {
      tone: "warning",
      title: "Plano ativo com setup pendente",
      detail: input.whatsappActive
        ? "O plano ja foi ativado, mas ainda existe bloqueio operacional antes do teste real."
        : "O plano ja foi ativado, mas o WhatsApp ainda nao esta pronto para operacao comercial.",
      nextStep: input.whatsappActive
        ? "Revisar o diagnostico e liberar o proximo bloqueio antes do teste final."
        : "Concluir a configuracao do WhatsApp e validar a conexao antes do teste real."
    };
  }

  if (paidFeaturePolicy.subscriptionStatus === "CANCELED" || paidFeaturePolicy.subscriptionStatus === "EXPIRED") {
    return {
      tone: "danger",
      title: "Plano sem cobertura comercial",
      detail: paidFeaturePolicy.userMessageDetail,
      nextStep: paidFeaturePolicy.userNextStep
    };
  }

  return {
    tone: "warning",
    title: "Plano pendente de ativacao",
    detail: "Seu painel ja esta criado, mas a operacao real continua bloqueada ate a confirmacao do pagamento.",
    nextStep: paidFeaturePolicy.userNextStep
  };
}

export async function getSubscriptionForBusiness(businessId: string): Promise<SubscriptionSummary | null> {
  if (prisma) {
    const subscription = await prisma.subscription.findFirst({
      where: { businessId },
      include: { plan: true },
      orderBy: { createdAt: "desc" }
    });

    return subscription ? normalizeSubscriptionSummary(subscription) : null;
  }

  const subscription = mockStore.subscriptions.find((item) => item.businessId === businessId);
  if (!subscription) return null;

  return normalizeSubscriptionSummary({
    ...subscription,
    plan: PLAN_CATALOG.find((item) => item.id === subscription.planId) ?? null
  });
}

export async function getAllBusinessesWithSubscriptions() {
  if (prisma) {
    const businesses = await prisma.business.findMany({
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { plan: true }
        },
        whatsappConfig: true,
        owner: true
      },
      orderBy: { createdAt: "desc" }
    });

    return businesses.map((business) => ({
      ...business,
      subscriptions: business.subscriptions.map((subscription) => normalizeSubscriptionSummary(subscription))
    }));
  }

  return mockStore.businesses.map((business) => ({
    ...business,
    owner: mockStore.users.find((user) => user.id === business.ownerUserId) ?? null,
    subscriptions: mockStore.subscriptions
      .filter((item) => item.businessId === business.id)
      .map((subscription) =>
        normalizeSubscriptionSummary({
          ...subscription,
          plan: PLAN_CATALOG.find((plan) => plan.id === subscription.planId) ?? null
        })
      ),
    whatsappConfig: mockStore.whatsappConfigs.find((item) => item.businessId === business.id) ?? null
  }));
}

export async function updateSubscription(input: unknown) {
  const values = subscriptionUpdateSchema.parse(input);

  if (prisma) {
    const latest = await prisma.subscription.findFirst({
      where: { businessId: values.businessId },
      orderBy: { createdAt: "desc" }
    });

    if (latest) {
      return prisma.subscription.update({
        where: { id: latest.id },
        data: {
          planId: values.planId,
          status: values.status,
          activatedAt: values.status === "ACTIVE" ? new Date() : null,
          canceledAt: values.status === "CANCELED" ? new Date() : null
        }
      });
    }

    return prisma.subscription.create({
      data: {
        businessId: values.businessId,
        planId: values.planId,
        status: values.status
      }
    });
  }

  const subscription = mockStore.subscriptions.find((item) => item.businessId === values.businessId);
  if (!subscription) return null;

  subscription.planId = values.planId;
  subscription.status = values.status;
  subscription.updatedAt = mockStore.now();
  subscription.activatedAt = values.status === "ACTIVE" ? mockStore.now() : null;
  subscription.canceledAt = values.status === "CANCELED" ? mockStore.now() : null;
  return subscription;
}

export async function isSubscriptionActive(businessId: string) {
  const subscription = await getSubscriptionForBusiness(businessId);
  return subscription?.status === "ACTIVE";
}
