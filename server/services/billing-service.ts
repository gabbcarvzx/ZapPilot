import { hash } from "bcryptjs";

import {
  createAsaasSubscriptionCheckout,
  createOrUpdateAsaasCustomer,
  type AsaasCustomerInput,
  type AsaasCustomerResponse,
  type AsaasSubscriptionCheckoutInput,
  type AsaasSubscriptionCheckoutResponse
} from "@/lib/asaas";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { mockStore } from "@/lib/mock-store";
import { getPlanBySlug } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { asaasWebhookEventSchema, checkoutInputSchema } from "@/server/validators/billing";
import { type PaymentStatus, type SubscriptionRecord } from "@/types/domain";

interface BillingGateway {
  createOrUpdateCustomer(input: AsaasCustomerInput): Promise<AsaasCustomerResponse>;
  createSubscriptionCheckout(input: AsaasSubscriptionCheckoutInput): Promise<AsaasSubscriptionCheckoutResponse>;
}

interface StartCheckoutOptions {
  gateway?: BillingGateway;
  requestId?: string | null;
}

interface BillingRequestContext {
  requestId?: string | null;
}

interface WebhookPaymentPayload {
  id?: string;
  subscription?: string;
  externalReference?: string | null;
  status?: string;
}

interface WebhookSubscriptionPayload {
  id?: string;
  externalReference?: string | null;
  status?: string;
  deleted?: boolean;
}

interface AsaasWebhookEvent {
  id?: string;
  event: string;
  payment?: WebhookPaymentPayload;
  subscription?: WebhookSubscriptionPayload;
}

type BillingSubscription = SubscriptionRecord & {
  activatedAt: string | null;
};

interface BillingAccountSnapshot {
  user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    businessId?: string;
  } | null;
  business: {
    id: string;
    ownerUserId: string;
    name: string;
    slug: string;
    niche: string;
    document: string | null;
    phone: string;
  } | null;
  latestSubscription: BillingSubscription | null;
}

const defaultGateway: BillingGateway = {
  createOrUpdateCustomer: createOrUpdateAsaasCustomer,
  createSubscriptionCheckout: createAsaasSubscriptionCheckout
};

class UnauthorizedWebhookError extends Error {}

class InvalidWebhookPayloadError extends Error {}

function buildSubscriptionExternalReference(subscriptionId: string) {
  return `subscription:${subscriptionId}`;
}

interface BillingRemoteSnapshot {
  asaasPaymentId?: string;
  asaasSubscriptionId?: string;
  externalReference?: string | null;
  status?: string | null;
  event: string;
  eventId?: string;
}

const globalForBillingWebhookEvents = globalThis as typeof globalThis & {
  billingWebhookEventRegistry?: Map<string, string>;
};

function billingWebhookEventRegistry() {
  if (!globalForBillingWebhookEvents.billingWebhookEventRegistry) {
    globalForBillingWebhookEvents.billingWebhookEventRegistry = new Map<string, string>();
  }

  return globalForBillingWebhookEvents.billingWebhookEventRegistry;
}

function buildProcessedWebhookKey(eventId: string, subscriptionId: string) {
  return `${eventId}:${subscriptionId}`;
}

function markWebhookEventProcessed(eventId: string | undefined, subscriptionId: string) {
  if (!eventId) return;
  billingWebhookEventRegistry().set(buildProcessedWebhookKey(eventId, subscriptionId), new Date().toISOString());
}

function hasProcessedWebhookEvent(eventId: string | undefined, subscriptionId: string) {
  if (!eventId) return false;
  return billingWebhookEventRegistry().has(buildProcessedWebhookKey(eventId, subscriptionId));
}

function toPaymentStatus(status: string | null | undefined): PaymentStatus {
  switch (status?.trim().toUpperCase()) {
    case "CHECKOUT_PENDING":
      return "CHECKOUT_PENDING";
    case "RECEIVED":
      return "RECEIVED";
    case "CONFIRMED":
      return "CONFIRMED";
    case "OVERDUE":
      return "OVERDUE";
    case "REFUNDED":
      return "REFUNDED";
    case "CANCELED":
      return "CANCELED";
    default:
      return "PENDING";
  }
}

function getLatestMockSubscription(businessId: string) {
  for (let index = mockStore.subscriptions.length - 1; index >= 0; index -= 1) {
    const current = mockStore.subscriptions[index];
    if (current?.businessId === businessId) {
      return current;
    }
  }

  return null;
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.toISOString();
}

function normalizeBillingSubscription(
  subscription:
    | BillingSubscription
    | {
        id: string;
        businessId: string;
        planId: string;
        status: SubscriptionRecord["status"];
        asaasCustomerId?: string | null;
        asaasSubscriptionId?: string | null;
        asaasPaymentId?: string | null;
        checkoutUrl?: string | null;
        paymentStatus?: PaymentStatus | null;
        paidAt?: Date | string | null;
        currentPeriodStart?: Date | string | null;
        currentPeriodEnd?: Date | string | null;
        activatedAt?: Date | string | null;
        canceledAt?: Date | string | null;
        externalReference?: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
      }
): BillingSubscription {
  return {
    id: subscription.id,
    businessId: subscription.businessId,
    planId: subscription.planId,
    status: subscription.status,
    asaasCustomerId: subscription.asaasCustomerId ?? null,
    asaasSubscriptionId: subscription.asaasSubscriptionId ?? null,
    asaasPaymentId: subscription.asaasPaymentId ?? null,
    checkoutUrl: subscription.checkoutUrl ?? null,
    paymentStatus: subscription.paymentStatus ?? null,
    paidAt: toIsoString(subscription.paidAt),
    currentPeriodStart: toIsoString(subscription.currentPeriodStart),
    currentPeriodEnd: toIsoString(subscription.currentPeriodEnd),
    activatedAt: toIsoString(subscription.activatedAt),
    canceledAt: toIsoString(subscription.canceledAt),
    externalReference: subscription.externalReference ?? null,
    createdAt: typeof subscription.createdAt === "string" ? subscription.createdAt : subscription.createdAt.toISOString(),
    updatedAt: typeof subscription.updatedAt === "string" ? subscription.updatedAt : subscription.updatedAt.toISOString()
  };
}

async function loadAccountByEmail(email: string): Promise<BillingAccountSnapshot> {
  if (prisma) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: {
          include: {
            subscriptions: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    return {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash,
            businessId: user.business?.id
          }
        : null,
      business: user?.business
        ? {
            id: user.business.id,
            ownerUserId: user.business.ownerUserId,
            name: user.business.name,
            slug: user.business.slug,
            niche: user.business.niche,
            document:
              "document" in user.business && (typeof user.business.document === "string" || user.business.document === null)
                ? user.business.document
                : null,
            phone: "phone" in user.business ? user.business.phone : ""
          }
        : null,
      latestSubscription: user?.business?.subscriptions[0]
        ? normalizeBillingSubscription(user.business.subscriptions[0])
        : null
    };
  }

  const user = mockStore.users.find((item) => item.email === email) ?? null;
  const business = user ? mockStore.businesses.find((item) => item.id === user.businessId) ?? null : null;
  const latestSubscription = business ? getLatestMockSubscription(business.id) : null;

  return {
    user,
    business,
    latestSubscription: latestSubscription ? normalizeBillingSubscription(latestSubscription) : null
  };
}

async function createUser(params: { name: string; email: string; password: string }) {
  const passwordHash = await hash(params.password, 10);

  if (prisma) {
    return prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash
      }
    });
  }

  const ts = mockStore.now();
  const user = {
    id: mockStore.createId("user"),
    name: params.name,
    email: params.email,
    passwordHash,
    role: "CUSTOMER" as const,
    businessId: "",
    createdAt: ts,
    updatedAt: ts
  };

  mockStore.users.push(user);
  return user;
}

async function createBusiness(params: {
  ownerUserId: string;
  name: string;
  email: string;
  phone: string;
  document: string;
}) {
  const baseSlug = slugify(params.email.split("@")[0] || params.name || "cliente");
  const uniqueSuffix = Math.random().toString(36).slice(2, 6);
  const slug = `${baseSlug}-${uniqueSuffix}`;

  if (prisma) {
    return prisma.business.create({
      data: {
        ownerUserId: params.ownerUserId,
        name: params.name,
        slug,
        niche: "Nao definido",
        document: params.document,
        phone: params.phone
      }
    });
  }

  const ts = mockStore.now();
  const business = {
    id: mockStore.createId("biz"),
    ownerUserId: params.ownerUserId,
    name: params.name,
    slug,
    niche: "Nao definido",
    document: params.document,
    address: "",
    phone: params.phone,
    whatsappNumber: "",
    businessHours: "",
    welcomeMessage: "Ola. Como posso ajudar?",
    closedMessage: "Agora estamos fora do horario, mas vamos responder assim que possivel.",
    tone: "Profissional, simples, direto e comercial",
    isOnboardingComplete: false,
    createdAt: ts,
    updatedAt: ts
  };

  mockStore.businesses.push(business);

  const user = mockStore.users.find((item) => item.id === params.ownerUserId);
  if (user) {
    user.businessId = business.id;
    user.updatedAt = ts;
  }

  return business;
}

async function createPendingSubscription(params: { businessId: string; planId: string }) {
  if (prisma) {
    const subscription = await prisma.subscription.create({
      data: {
        businessId: params.businessId,
        planId: params.planId,
        status: "PENDING",
        paymentStatus: "CHECKOUT_PENDING"
      }
    });

    return normalizeBillingSubscription(subscription);
  }

  const ts = mockStore.now();
  const subscription: BillingSubscription = {
    id: mockStore.createId("sub"),
    businessId: params.businessId,
    planId: params.planId,
    status: "PENDING",
    asaasCustomerId: null,
    asaasSubscriptionId: null,
    asaasPaymentId: null,
    checkoutUrl: null,
    paymentStatus: "CHECKOUT_PENDING",
    paidAt: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    activatedAt: null,
    canceledAt: null,
    externalReference: null,
    createdAt: ts,
    updatedAt: ts
  };

  mockStore.subscriptions.push(subscription);
  return subscription;
}

async function updateSubscription(
  subscriptionId: string,
  data: Partial<BillingSubscription> & { planId?: string }
) {
  if (prisma) {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data
    });

    return normalizeBillingSubscription(subscription);
  }

  const subscription = mockStore.subscriptions.find((item) => item.id === subscriptionId);
  if (!subscription) {
    throw new Error("Assinatura nao encontrada.");
  }

  Object.assign(subscription, data, { updatedAt: mockStore.now() });
  return subscription;
}

function findMockSubscriptionByAsaasRefs(input: {
  asaasPaymentId?: string;
  asaasSubscriptionId?: string;
  externalReference?: string | null;
}) {
  if (input.asaasPaymentId) {
    const byPayment = mockStore.subscriptions.find((item) => item.asaasPaymentId === input.asaasPaymentId);
    if (byPayment) return byPayment;
  }

  if (input.asaasSubscriptionId) {
    const bySubscription = mockStore.subscriptions.find(
      (item) => item.asaasSubscriptionId === input.asaasSubscriptionId
    );
    if (bySubscription) return bySubscription;
  }

  if (input.externalReference) {
    const byExternalReference = mockStore.subscriptions.find(
      (item) => item.externalReference === input.externalReference || `subscription:${item.id}` === input.externalReference
    );
    if (byExternalReference) return byExternalReference;
  }

  return null;
}

async function findSubscriptionForWebhook(input: {
  asaasPaymentId?: string;
  asaasSubscriptionId?: string;
  externalReference?: string | null;
}) {
  if (!input.asaasPaymentId && !input.asaasSubscriptionId && !input.externalReference) {
    return null;
  }

  if (prisma) {
    const filters: Array<
      | { asaasPaymentId: string }
      | { asaasSubscriptionId: string }
      | { externalReference: string }
    > = [];

    if (input.asaasPaymentId) {
      filters.push({ asaasPaymentId: input.asaasPaymentId });
    }

    if (input.asaasSubscriptionId) {
      filters.push({ asaasSubscriptionId: input.asaasSubscriptionId });
    }

    if (input.externalReference) {
      filters.push({ externalReference: input.externalReference });
    }

    return prisma.subscription.findFirst({
      where: {
        OR: filters
      }
    });
  }

  return findMockSubscriptionByAsaasRefs(input);
}

function hasTrustedExternalReference(
  subscription: BillingSubscription,
  externalReference: string | null | undefined
) {
  if (!externalReference) {
    return true;
  }

  return externalReference === subscription.externalReference || externalReference === buildSubscriptionExternalReference(subscription.id);
}

function nextPaymentStatusFromEvent(event: string): PaymentStatus | null {
  switch (event) {
    case "PAYMENT_CREATED":
      return "PENDING";
    case "PAYMENT_RECEIVED":
      return "RECEIVED";
    case "PAYMENT_CONFIRMED":
      return "CONFIRMED";
    case "PAYMENT_OVERDUE":
      return "OVERDUE";
    case "PAYMENT_DELETED":
      return "CANCELED";
    case "PAYMENT_REFUNDED":
      return "REFUNDED";
    default:
      return null;
  }
}

function nextSubscriptionStatusFromEvent(
  currentStatus: BillingSubscription["status"],
  event: string
): BillingSubscription["status"] {
  switch (event) {
    case "PAYMENT_CREATED":
      return currentStatus === "ACTIVE" ? "ACTIVE" : "PENDING";
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED":
      return "ACTIVE";
    case "PAYMENT_OVERDUE":
      return "EXPIRED";
    case "PAYMENT_DELETED":
    case "PAYMENT_REFUNDED":
    case "SUBSCRIPTION_DELETED":
      return "CANCELED";
    case "SUBSCRIPTION_CREATED":
      return currentStatus;
    default:
      return currentStatus;
  }
}

function getPaymentRefsFromEvent(event: AsaasWebhookEvent) {
  return {
    asaasPaymentId: event.payment?.id,
    asaasSubscriptionId: event.payment?.subscription ?? event.subscription?.id,
    externalReference: event.payment?.externalReference ?? event.subscription?.externalReference ?? null
  };
}

function buildWebhookUpdate(
  current: BillingSubscription,
  event: AsaasWebhookEvent
): Partial<BillingSubscription> & { planId?: string } {
  const nextPaymentStatus = nextPaymentStatusFromEvent(event.event);
  const nextStatus = nextSubscriptionStatusFromEvent(current.status, event.event);
  const now = prisma ? new Date().toISOString() : mockStore.now();
  const asaasSubscriptionId = event.payment?.subscription ?? event.subscription?.id ?? current.asaasSubscriptionId;
  const asaasPaymentId = event.payment?.id ?? current.asaasPaymentId;
  const externalReference =
    event.payment?.externalReference ?? event.subscription?.externalReference ?? current.externalReference;

  return {
    status: nextStatus,
    paymentStatus: nextPaymentStatus ?? current.paymentStatus,
    asaasSubscriptionId,
    asaasPaymentId,
    externalReference,
    activatedAt:
      nextStatus === "ACTIVE"
        ? current.activatedAt ?? now
        : current.activatedAt,
    paidAt:
      event.event === "PAYMENT_RECEIVED" || event.event === "PAYMENT_CONFIRMED"
        ? current.paidAt ?? now
        : current.paidAt,
    canceledAt:
      nextStatus === "CANCELED"
        ? current.canceledAt ?? now
        : current.canceledAt
  };
}

function isDuplicateWebhookUpdate(
  current: BillingSubscription,
  update: Partial<BillingSubscription> & { planId?: string }
) {
  return (
    current.status === update.status &&
    current.paymentStatus === update.paymentStatus &&
    current.asaasSubscriptionId === update.asaasSubscriptionId &&
    current.asaasPaymentId === update.asaasPaymentId &&
    current.externalReference === update.externalReference &&
    current.activatedAt === (update.activatedAt ?? current.activatedAt) &&
    current.paidAt === (update.paidAt ?? current.paidAt) &&
    current.canceledAt === (update.canceledAt ?? current.canceledAt)
  );
}

function assertWebhookToken(token: string | null | undefined) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN?.trim() ?? "";

  if (!expected || token?.trim() !== expected) {
    throw new UnauthorizedWebhookError("Webhook ASAAS nao autorizado.");
  }
}

export async function startCheckout(input: unknown, options: StartCheckoutOptions = {}) {
  const values = checkoutInputSchema.parse(input);
  const plan = getPlanBySlug(values.plan);

  if (!plan) {
    logWarn("billing.checkout.invalid_plan", {
      requestId: options.requestId,
      metadata: {
        plan: values.plan
      }
    });
    throw new Error("Plano invalido.");
  }

  const gateway = options.gateway ?? defaultGateway;
  const email = values.email.trim().toLowerCase();
  const account = await loadAccountByEmail(email);

  if (account.latestSubscription?.status === "ACTIVE") {
    logInfo("billing.checkout.active_subscription_reused", {
      businessId: account.business?.id ?? account.user?.businessId ?? null,
      userId: account.user?.id ?? null,
      requestId: options.requestId,
      metadata: {
        planCode: plan.code
      }
    });
    return {
      outcome: "active_exists" as const,
      redirectTo: "/dashboard",
      subscription: account.latestSubscription
    };
  }

  const user =
    account.user ??
    (await createUser({
      name: values.name,
      email,
      password: values.password
    }));

  const business =
    account.business ??
    (await createBusiness({
      ownerUserId: user.id,
      name: values.name,
      email,
      phone: values.phone,
      document: values.document
    }));

  const pendingSubscription =
    account.latestSubscription?.status === "PENDING"
      ? account.latestSubscription
      : await createPendingSubscription({
          businessId: business.id,
          planId: plan.id
        });

  const externalReference = pendingSubscription.externalReference ?? `subscription:${pendingSubscription.id}`;

  if (pendingSubscription.checkoutUrl && pendingSubscription.planId === plan.id) {
    logInfo("billing.checkout.reused_pending_url", {
      businessId: business.id,
      userId: user.id,
      requestId: options.requestId,
      metadata: {
        planCode: plan.code
      }
    });
    return {
      outcome: "payment_required" as const,
      redirectTo: pendingSubscription.checkoutUrl,
      subscription: pendingSubscription
    };
  }

  try {
    const customer = await gateway.createOrUpdateCustomer({
      name: values.name,
      email,
      mobilePhone: values.phone,
      cpfCnpj: values.document,
      externalReference: business.id,
      existingCustomerId: pendingSubscription.asaasCustomerId ?? undefined
    });

    await updateSubscription(pendingSubscription.id, {
      planId: plan.id,
      status: "PENDING",
      externalReference,
      asaasCustomerId: customer.id,
      paymentStatus: pendingSubscription.paymentStatus ?? "CHECKOUT_PENDING"
    });

    const checkout = await gateway.createSubscriptionCheckout({
      customerId: customer.id,
      plan,
      externalReference,
      email
    });

    const updatedSubscription = await updateSubscription(pendingSubscription.id, {
      planId: plan.id,
      status: "PENDING",
      externalReference,
      asaasCustomerId: customer.id,
      asaasSubscriptionId: checkout.id,
      asaasPaymentId: checkout.paymentId,
      checkoutUrl: checkout.invoiceUrl,
      paymentStatus: toPaymentStatus(checkout.status)
    });

    logInfo("billing.checkout.started", {
      businessId: business.id,
      userId: user.id,
      requestId: options.requestId,
      metadata: {
        planCode: plan.code,
        paymentStatus: updatedSubscription.paymentStatus
      }
    });

    return {
      outcome: "payment_required" as const,
      redirectTo: checkout.invoiceUrl,
      subscription: updatedSubscription
    };
  } catch (error) {
    logError("billing.checkout.failed", {
      businessId: account.business?.id ?? null,
      userId: account.user?.id ?? null,
      requestId: options.requestId,
      metadata: {
        planCode: plan.code,
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });
    throw new Error("Nao foi possivel iniciar o checkout agora.");
  }
}

export async function handleAsaasWebhook(input: unknown, context: BillingRequestContext = {}) {
  const parsed = asaasWebhookEventSchema.safeParse(input);

  if (!parsed.success) {
    throw new InvalidWebhookPayloadError("Payload de webhook invalido.");
  }

  const event = parsed.data as AsaasWebhookEvent;
  const trackedEvents = new Set([
    "PAYMENT_CREATED",
    "PAYMENT_RECEIVED",
    "PAYMENT_CONFIRMED",
    "PAYMENT_OVERDUE",
    "PAYMENT_DELETED",
    "PAYMENT_REFUNDED",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_DELETED"
  ]);

  if (!trackedEvents.has(event.event)) {
    logInfo("billing.webhook.event_ignored", {
      requestId: context.requestId,
      metadata: {
        event: event.event,
        eventId: event.id ?? null
      }
    });

    return {
      ok: true as const,
      status: "ignored" as const,
      event: event.event,
      eventId: event.id ?? null
    };
  }

  const refs = getPaymentRefsFromEvent(event);
  const current = (await findSubscriptionForWebhook(refs)) as BillingSubscription | null;

  if (!current) {
    logWarn("billing.webhook.subscription_not_found", {
      requestId: context.requestId,
      metadata: {
        event: event.event,
        eventId: event.id ?? null,
        ...refs
      }
    });
    return {
      ok: true as const,
      status: "ignored" as const,
      event: event.event,
      eventId: event.id ?? null
    };
  }

  if (!hasTrustedExternalReference(current, refs.externalReference)) {
    logWarn("billing.webhook.external_reference_mismatch", {
      businessId: current.businessId,
      requestId: context.requestId,
      metadata: {
        event: event.event,
        eventId: event.id ?? null,
        externalReference: refs.externalReference
      }
    });

    return {
      ok: true as const,
      status: "ignored" as const,
      event: event.event,
      eventId: event.id ?? null
    };
  }

  if (hasProcessedWebhookEvent(event.id, current.id)) {
    logInfo("billing.webhook.duplicate_event_id_ignored", {
      businessId: current.businessId,
      requestId: context.requestId,
      metadata: {
        event: event.event,
        eventId: event.id,
        subscriptionId: current.id
      }
    });

    return {
      ok: true as const,
      status: "duplicate" as const,
      event: event.event,
      eventId: event.id ?? null,
      subscriptionId: current.id,
      subscriptionStatus: current.status,
      paymentStatus: current.paymentStatus
    };
  }

  const nextUpdate = buildWebhookUpdate(current, event);

  if (isDuplicateWebhookUpdate(current, nextUpdate)) {
    logInfo("billing.webhook.duplicate_ignored", {
      businessId: current.businessId,
      requestId: context.requestId,
      metadata: {
        event: event.event,
        eventId: event.id ?? null,
        subscriptionId: current.id
      }
    });

    markWebhookEventProcessed(event.id, current.id);

    return {
      ok: true as const,
      status: "duplicate" as const,
      event: event.event,
      eventId: event.id ?? null,
      subscriptionId: current.id,
      subscriptionStatus: current.status,
      paymentStatus: current.paymentStatus
    };
  }

  const updated = await updateSubscription(current.id, nextUpdate);
  markWebhookEventProcessed(event.id, current.id);

  logInfo("billing.webhook.processed", {
    businessId: updated.businessId,
    requestId: context.requestId,
    metadata: {
      event: event.event,
      eventId: event.id ?? null,
      subscriptionId: updated.id,
      subscriptionStatus: updated.status,
      paymentStatus: updated.paymentStatus
    }
  });

  return {
    ok: true as const,
    status: "processed" as const,
    event: event.event,
    eventId: event.id ?? null,
    subscriptionId: updated.id,
    subscriptionStatus: updated.status,
    paymentStatus: updated.paymentStatus
  };
}

export async function reconcileSubscriptionWithRemoteSnapshot(
  snapshot: BillingRemoteSnapshot,
  context: BillingRequestContext = {}
) {
  const current = (await findSubscriptionForWebhook({
    asaasPaymentId: snapshot.asaasPaymentId,
    asaasSubscriptionId: snapshot.asaasSubscriptionId,
    externalReference: snapshot.externalReference ?? null
  })) as BillingSubscription | null;

  if (!current) {
    logWarn("billing.reconciliation.subscription_not_found", {
      requestId: context.requestId,
      metadata: {
        event: snapshot.event,
        eventId: snapshot.eventId ?? null,
        asaasPaymentId: snapshot.asaasPaymentId ?? null,
        asaasSubscriptionId: snapshot.asaasSubscriptionId ?? null
      }
    });

    return {
      status: "ignored" as const
    };
  }

  const event: AsaasWebhookEvent = {
    id: snapshot.eventId,
    event: snapshot.event,
    payment: {
      id: snapshot.asaasPaymentId,
      subscription: snapshot.asaasSubscriptionId,
      externalReference: snapshot.externalReference ?? null,
      status: snapshot.status ?? undefined
    }
  };

  const nextUpdate = buildWebhookUpdate(current, event);
  if (isDuplicateWebhookUpdate(current, nextUpdate)) {
    return {
      status: "aligned" as const,
      subscriptionId: current.id
    };
  }

  const updated = await updateSubscription(current.id, nextUpdate);
  logInfo("billing.reconciliation.updated", {
    businessId: updated.businessId,
    requestId: context.requestId,
    metadata: {
      event: snapshot.event,
      eventId: snapshot.eventId ?? null,
      subscriptionId: updated.id,
      subscriptionStatus: updated.status,
      paymentStatus: updated.paymentStatus
    }
  });

  return {
    status: "updated" as const,
    subscriptionId: updated.id
  };
}

export { InvalidWebhookPayloadError, UnauthorizedWebhookError, assertWebhookToken };
