import { hash } from "bcryptjs";

import { mockStore } from "@/lib/mock-store";
import { PLAN_CATALOG } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { businessSchema, faqSchema, productSchema, whatsappConfigSchema } from "@/server/validators/business";
import { signUpSchema } from "@/server/validators/auth";

export async function createAccount(input: unknown) {
  const values = signUpSchema.parse(input);
  const passwordHash = await hash(values.password, 10);
  const slug = `${slugify(values.businessName)}-${Math.random().toString(36).slice(2, 6)}`;

  if (prisma) {
    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email.toLowerCase(),
        passwordHash
      }
    });

    const business = await prisma.business.create({
      data: {
        ownerUserId: user.id,
        name: values.businessName,
        slug,
        niche: values.niche
      }
    });

    await prisma.subscription.create({
      data: {
        businessId: business.id,
        planId: PLAN_CATALOG[0].id,
        status: "PENDING"
      }
    });

    await prisma.whatsAppConfig.create({
      data: {
        businessId: business.id
      }
    });

    return { userId: user.id, businessId: business.id };
  }

  const userId = mockStore.createId("user");
  const businessId = mockStore.createId("biz");
  const ts = mockStore.now();

  mockStore.users.push({
    id: userId,
    name: values.name,
    email: values.email.toLowerCase(),
    passwordHash,
    role: "CUSTOMER",
    businessId,
    createdAt: ts,
    updatedAt: ts
  });

  mockStore.businesses.push({
    id: businessId,
    ownerUserId: userId,
    name: values.businessName,
    slug,
    niche: values.niche,
    address: "",
    phone: "",
    whatsappNumber: "",
    businessHours: "",
    welcomeMessage: "Olá. Como posso ajudar?",
    closedMessage: "Agora estamos fora do horário, mas vamos responder assim que possível.",
    tone: "Profissional, simples, direto e comercial",
    isOnboardingComplete: false,
    createdAt: ts,
    updatedAt: ts
  });

  mockStore.subscriptions.push({
    id: mockStore.createId("sub"),
    businessId,
    planId: PLAN_CATALOG[0].id,
    status: "PENDING",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    activatedAt: null,
    canceledAt: null,
    externalReference: null,
    createdAt: ts,
    updatedAt: ts
  });

  mockStore.whatsappConfigs.push({
    id: mockStore.createId("wa"),
    businessId,
    metaBusinessAccountId: "",
    metaPhoneNumberId: "",
    metaAppId: "",
    verifyToken: "",
    accessToken: "",
    webhookStatus: "mock",
    isActive: false,
    createdAt: ts,
    updatedAt: ts
  });

  return { userId, businessId };
}

export function getBusinessSnapshot(businessId: string) {
  if (prisma) {
    return prisma.business.findUnique({
      where: { id: businessId },
      include: {
        products: true,
        faqs: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            plan: true
          }
        },
        whatsappConfig: true
      }
    });
  }

  const business = mockStore.businesses.find((item) => item.id === businessId);
  if (!business) return null;

  return {
    ...business,
    products: mockStore.products.filter((item) => item.businessId === businessId),
    faqs: mockStore.faqs.filter((item) => item.businessId === businessId),
    subscriptions: mockStore.subscriptions
      .filter((item) => item.businessId === businessId)
      .map((subscription) => ({
        ...subscription,
        plan: mockStore.plans.find((plan) => plan.id === subscription.planId) ?? null
      })),
    whatsappConfig: mockStore.whatsappConfigs.find((item) => item.businessId === businessId) ?? null
  };
}

export async function updateBusiness(businessId: string, input: unknown) {
  const values = businessSchema.parse(input);

  if (prisma) {
    return prisma.business.update({
      where: { id: businessId },
      data: {
        name: values.name,
        niche: values.niche,
        address: values.address,
        phone: values.phone,
        whatsappNumber: values.whatsappNumber,
        businessHoursJson: values.businessHours,
        welcomeMessage: values.welcomeMessage,
        closedMessage: values.closedMessage,
        tone: values.tone,
        isOnboardingComplete: values.isOnboardingComplete ?? false
      }
    });
  }

  const business = mockStore.businesses.find((item) => item.id === businessId);
  if (!business) return null;

  Object.assign(business, values, { updatedAt: mockStore.now() });
  return business;
}

export async function updateWhatsAppConfig(businessId: string, input: unknown) {
  const values = whatsappConfigSchema.parse(input);

  if (prisma) {
    return prisma.whatsAppConfig.upsert({
      where: { businessId },
      update: values,
      create: {
        businessId,
        ...values
      }
    });
  }

  const config = mockStore.whatsappConfigs.find((item) => item.businessId === businessId);
  if (!config) return null;
  Object.assign(config, values, { updatedAt: mockStore.now() });
  return config;
}

export async function replaceProducts(businessId: string, items: unknown[]) {
  const values = items.map((item) => productSchema.parse(item));

  if (prisma) {
    await prisma.product.deleteMany({ where: { businessId } });
    return prisma.product.createMany({
      data: values.map((item, index) => ({
        businessId,
        ...item,
        sortOrder: item.sortOrder ?? index
      }))
    });
  }

  const created = values.map((item, index) => ({
    id: mockStore.createId("prod"),
    businessId,
    ...item,
    sortOrder: item.sortOrder ?? index,
    createdAt: mockStore.now(),
    updatedAt: mockStore.now()
  }));
  const current = mockStore.products;
  for (let index = current.length - 1; index >= 0; index -= 1) {
    if (current[index]?.businessId === businessId) {
      current.splice(index, 1);
    }
  }
  current.push(...created);
  return created;
}

export async function replaceFaqs(businessId: string, items: unknown[]) {
  const values = items.map((item) => faqSchema.parse(item));

  if (prisma) {
    await prisma.fAQ.deleteMany({ where: { businessId } });
    return prisma.fAQ.createMany({
      data: values.map((item, index) => ({
        businessId,
        ...item,
        sortOrder: item.sortOrder ?? index
      }))
    });
  }

  const created = values.map((item, index) => ({
    id: mockStore.createId("faq"),
    businessId,
    ...item,
    sortOrder: item.sortOrder ?? index,
    createdAt: mockStore.now(),
    updatedAt: mockStore.now()
  }));
  const current = mockStore.faqs;
  for (let index = current.length - 1; index >= 0; index -= 1) {
    if (current[index]?.businessId === businessId) {
      current.splice(index, 1);
    }
  }
  current.push(...created);
  return created;
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  if (prisma) {
    return prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        business: true
      }
    });
  }

  return mockStore.users.find((item) => item.email === normalizedEmail) ?? null;
}
