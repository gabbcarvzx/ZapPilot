import { mockStore } from "@/lib/mock-store";
import { PLAN_CATALOG } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { subscriptionUpdateSchema } from "@/server/validators/admin";

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
