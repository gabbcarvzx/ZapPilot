import { mockStore } from "@/lib/mock-store";
import { PLAN_CATALOG } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { subscriptionUpdateSchema } from "@/server/validators/admin";

type ActivationGuidanceTone = "success" | "warning" | "danger";

interface ActivationGuidanceInput {
  subscriptionStatus: "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED" | null | undefined;
  whatsappActive: boolean;
  readinessStatus: "ready" | "blocked";
}

interface ActivationGuidance {
  tone: ActivationGuidanceTone;
  title: string;
  detail: string;
  nextStep: string;
}

export function getActivationGuidance(input: ActivationGuidanceInput): ActivationGuidance {
  if (input.subscriptionStatus === "ACTIVE" && input.readinessStatus === "ready") {
    return {
      tone: "success",
      title: "Pronto para teste real",
      detail: "Plano ativo e base operacional suficiente para validar a empresa com mensagens reais.",
      nextStep: "Executar teste no WhatsApp do cliente e confirmar resposta ponta a ponta."
    };
  }

  if (input.subscriptionStatus === "ACTIVE") {
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

  if (input.subscriptionStatus === "CANCELED" || input.subscriptionStatus === "EXPIRED") {
    return {
      tone: "danger",
      title: "Plano sem cobertura comercial",
      detail: "A automacao fica bloqueada porque a empresa esta cancelada ou expirada.",
      nextStep: "Reativar ou renovar o plano antes de liberar novas respostas automaticas."
    };
  }

  return {
    tone: "warning",
    title: "Plano pendente de ativacao",
    detail: "A automacao ainda nao responde porque a ativacao comercial depende da acao manual da operacao.",
    nextStep: "Na area de operacao, trocar o status para ativo quando a empresa estiver aprovada para uso."
  };
}

export async function getSubscriptionForBusiness(businessId: string) {
  if (prisma) {
    return prisma.subscription.findFirst({
      where: { businessId },
      include: { plan: true },
      orderBy: { createdAt: "desc" }
    });
  }

  const subscription = mockStore.subscriptions.find((item) => item.businessId === businessId);
  if (!subscription) return null;

  return {
    ...subscription,
    plan: PLAN_CATALOG.find((item) => item.id === subscription.planId) ?? null
  };
}

export async function getAllBusinessesWithSubscriptions() {
  if (prisma) {
    return prisma.business.findMany({
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
  }

  return mockStore.businesses.map((business) => ({
    ...business,
    owner: mockStore.users.find((user) => user.id === business.ownerUserId) ?? null,
    subscriptions: mockStore.subscriptions
      .filter((item) => item.businessId === business.id)
      .map((subscription) => ({
        ...subscription,
        plan: PLAN_CATALOG.find((plan) => plan.id === subscription.planId) ?? null
      })),
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
