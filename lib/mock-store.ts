import { hashSync } from "bcryptjs";

import { envFlags } from "@/lib/env";
import { PLAN_CATALOG } from "@/lib/plans";
import {
  BusinessRecord,
  ConversationRecord,
  FaqRecord,
  LeadRecord,
  MessageRecord,
  ProductRecord,
  SubscriptionRecord,
  UserRecord,
  WhatsAppConfigRecord
} from "@/types/domain";

function now() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const globalForMockStore = globalThis as unknown as {
  mockStore?: MockStoreState;
};

interface MockStoreState {
  users: UserRecord[];
  businesses: BusinessRecord[];
  subscriptions: SubscriptionRecord[];
  whatsappConfigs: WhatsAppConfigRecord[];
  products: ProductRecord[];
  faqs: FaqRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  leads: LeadRecord[];
}

function createDefaultStore(): MockStoreState {
  const ts = now();
  const businessId = "biz_demo";
  const userId = "user_demo";
  const conversationId = "conv_demo";
  const leadId = "lead_demo";

  return {
    users: [
      {
        id: userId,
        name: "Admin Local",
        email: "admin@local.test",
        passwordHash: hashSync("admin123", 10),
        role: "ADMIN",
        businessId,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    businesses: [
      {
        id: businessId,
        ownerUserId: userId,
        name: "ZapBurger Centro",
        slug: "zapburger-centro",
        niche: "Hamburgueria",
        document: null,
        address: "Rua do Centro, 120",
        phone: "(11) 99999-9999",
        whatsappNumber: "(11) 99999-9999",
        businessHours: "Seg a Sab, 18h às 23h",
        welcomeMessage: "Olá. Aqui é a ZapBurger. Como posso ajudar com seu pedido?",
        closedMessage: "Agora estamos fora do horário, mas já deixamos seu contato registrado.",
        tone: "Profissional, simples, direto e comercial",
        isOnboardingComplete: true,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    subscriptions: [
      {
        id: "sub_demo",
        businessId,
        planId: "plan_pro",
        status: "ACTIVE",
        asaasCustomerId: null,
        asaasSubscriptionId: null,
        asaasPaymentId: null,
        checkoutUrl: null,
        paymentStatus: "CONFIRMED",
        paidAt: ts,
        currentPeriodStart: ts,
        currentPeriodEnd: ts,
        activatedAt: ts,
        canceledAt: null,
        externalReference: null,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    whatsappConfigs: [
      {
        id: "wa_demo",
        businessId,
        metaBusinessAccountId: "",
        metaPhoneNumberId: "mock",
        metaAppId: "",
        verifyToken: "",
        accessToken: "",
        webhookStatus: "mock",
        isActive: false,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    products: [
      {
        id: "prod_demo_1",
        businessId,
        name: "Combo Smash Duplo",
        description: "Hambúrguer, fritas e refrigerante.",
        price: "39,90",
        isActive: true,
        sortOrder: 1,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    faqs: [
      {
        id: "faq_demo_1",
        businessId,
        question: "Vocês entregam?",
        answer: "Sim. Entregamos na região central e bairros próximos.",
        sortOrder: 1,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    conversations: [
      {
        id: conversationId,
        businessId,
        contactPhone: "5511998887777",
        contactName: "Cliente Demo",
        status: "OPEN",
        lastMessageAt: ts,
        leadId,
        createdAt: ts,
        updatedAt: ts
      }
    ],
    messages: [
      {
        id: "msg_demo_1",
        businessId,
        conversationId,
        direction: "INBOUND",
        source: "USER",
        content: "Quero saber o preço do combo.",
        metaJson: "{}",
        sentAt: ts,
        createdAt: ts
      },
      {
        id: "msg_demo_2",
        businessId,
        conversationId,
        direction: "OUTBOUND",
        source: "BOT",
        content: "Temos combo a partir de R$ 39,90. Se quiser, já te mostro as opções.",
        metaJson: "{}",
        sentAt: ts,
        createdAt: ts
      }
    ],
    leads: [
      {
        id: leadId,
        businessId,
        conversationId,
        name: "Cliente Demo",
        phone: "5511998887777",
        notes: "Lead criado em modo mock.",
        status: "QUALIFIED",
        createdAt: ts,
        updatedAt: ts
      }
    ]
  };
}

function store() {
  if (!envFlags.mockModeEnabled && process.env.NODE_ENV !== "test") {
    throw new Error("Mock store desabilitado. Defina MOCK_MODE_ENABLED=true apenas para desenvolvimento controlado.");
  }

  if (!globalForMockStore.mockStore) {
    globalForMockStore.mockStore = createDefaultStore();
  }

  return globalForMockStore.mockStore;
}

export const mockStore = {
  plans: PLAN_CATALOG,
  get users() {
    return store().users;
  },
  get businesses() {
    return store().businesses;
  },
  get subscriptions() {
    return store().subscriptions;
  },
  get whatsappConfigs() {
    return store().whatsappConfigs;
  },
  get products() {
    return store().products;
  },
  get faqs() {
    return store().faqs;
  },
  get conversations() {
    return store().conversations;
  },
  get messages() {
    return store().messages;
  },
  get leads() {
    return store().leads;
  },
  createId: makeId,
  now,
  reset() {
    globalForMockStore.mockStore = createDefaultStore();
  }
};
