import { hash } from "bcryptjs";
import { PrismaClient, SubscriptionStatus } from "@prisma/client";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { PLAN_CATALOG } from "@/lib/plans";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123456";

interface DemoSeedTenant {
  owner: {
    name: string;
    email: string;
  };
  business: {
    name: string;
    slug: string;
    niche: string;
    address: string;
    phone: string;
    whatsappNumber: string;
    businessHoursJson: string;
    welcomeMessage: string;
    closedMessage: string;
    tone: string;
  };
  subscription: {
    planId: string;
    status: SubscriptionStatus;
  };
  whatsappConfig: {
    metaBusinessAccountId: string;
    metaPhoneNumberId: string;
    metaAppId: string;
    verifyToken: string;
    accessToken: string;
    webhookStatus: string;
    isActive: boolean;
  };
  products: Array<{
    name: string;
    description: string;
    price: string;
    sortOrder: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
    sortOrder: number;
  }>;
  conversations: Array<{
    contactName: string;
    contactPhone: string;
    status: "OPEN" | "NEEDS_HUMAN" | "CLOSED";
    lead: {
      name: string;
      phone: string;
      status: "NEW" | "QUALIFIED" | "NEEDS_HUMAN" | "CONVERTED";
      notes: string;
    };
    messages: Array<{
      direction: "INBOUND" | "OUTBOUND";
      source: "USER" | "BOT" | "HUMAN" | "SYSTEM";
      content: string;
    }>;
  }>;
}

export const DEMO_SEED_TENANTS: DemoSeedTenant[] = [
  {
    owner: {
      name: "Demo ZapBurger",
      email: "demo+zapburger@zappilot.local"
    },
    business: {
      name: "ZapBurger Centro",
      slug: "demo-zapburger-centro",
      niche: "Hamburgueria",
      address: "Rua Augusta, 1200 - Sao Paulo",
      phone: "(11) 4002-1001",
      whatsappNumber: "551140021001",
      businessHoursJson: "Seg a Dom, 18h as 23h30",
      welcomeMessage: "Ola. Aqui e a ZapBurger Centro. Posso te ajudar com combos, entregas e pedidos.",
      closedMessage: "Estamos fora do horario agora, mas deixamos seu pedido encaminhado para a abertura.",
      tone: "Comercial, rapido e amigavel"
    },
    subscription: {
      planId: "plan_pro",
      status: "ACTIVE"
    },
    whatsappConfig: {
      metaBusinessAccountId: "",
      metaPhoneNumberId: "",
      metaAppId: "",
      verifyToken: "",
      accessToken: "",
      webhookStatus: "mock",
      isActive: false
    },
    products: [
      {
        name: "Combo Smash Duplo",
        description: "Burger duplo, fritas crocantes e refrigerante em lata.",
        price: "39,90",
        sortOrder: 1
      },
      {
        name: "Combo Chicken Crispy",
        description: "Sanduiche de frango empanado com molho da casa e fritas.",
        price: "34,90",
        sortOrder: 2
      }
    ],
    faqs: [
      {
        question: "Qual o tempo medio de entrega?",
        answer: "Entre 35 e 50 minutos na regiao central.",
        sortOrder: 1
      },
      {
        question: "Tem opcao sem lactose?",
        answer: "Sim. Podemos montar o burger sem queijo e ajustar os molhos.",
        sortOrder: 2
      }
    ],
    conversations: [
      {
        contactName: "Marina Lopes",
        contactPhone: "5511998877001",
        status: "OPEN",
        lead: {
          name: "Marina Lopes",
          phone: "5511998877001",
          status: "QUALIFIED",
          notes: "Cliente pedindo combo para entrega no jantar."
        },
        messages: [
          {
            direction: "INBOUND",
            source: "USER",
            content: "Quero saber o preco do combo smash duplo."
          },
          {
            direction: "OUTBOUND",
            source: "BOT",
            content: "O combo smash duplo sai por R$ 39,90 com fritas e bebida."
          }
        ]
      }
    ]
  },
  {
    owner: {
      name: "Demo Corte Nobre",
      email: "demo+cortenobre@zappilot.local"
    },
    business: {
      name: "Corte Nobre Barber",
      slug: "demo-corte-nobre-barber",
      niche: "Barbearia",
      address: "Rua Harmonia, 88 - Sao Paulo",
      phone: "(11) 4002-1002",
      whatsappNumber: "551140021002",
      businessHoursJson: "Ter a Sab, 10h as 20h",
      welcomeMessage: "Ola. Aqui e a Corte Nobre Barber. Posso te ajudar com horarios, servicos e encaixes.",
      closedMessage: "A barbearia esta fechada agora, mas registramos seu interesse para o proximo horario.",
      tone: "Direto, elegante e prestativo"
    },
    subscription: {
      planId: "plan_pro",
      status: "ACTIVE"
    },
    whatsappConfig: {
      metaBusinessAccountId: "",
      metaPhoneNumberId: "",
      metaAppId: "",
      verifyToken: "",
      accessToken: "",
      webhookStatus: "mock",
      isActive: false
    },
    products: [
      {
        name: "Corte masculino",
        description: "Corte tradicional com acabamento premium.",
        price: "45,00",
        sortOrder: 1
      },
      {
        name: "Barba completa",
        description: "Modelagem, toalha quente e finalizacao com balm.",
        price: "35,00",
        sortOrder: 2
      }
    ],
    faqs: [
      {
        question: "Vocês atendem por encaixe?",
        answer: "Sim, quando ha janela livre entre agendamentos confirmados.",
        sortOrder: 1
      },
      {
        question: "Aceitam pix?",
        answer: "Sim. Pix, debito e credito estao disponiveis no caixa.",
        sortOrder: 2
      }
    ],
    conversations: [
      {
        contactName: "Rafael Costa",
        contactPhone: "5511998877002",
        status: "NEEDS_HUMAN",
        lead: {
          name: "Rafael Costa",
          phone: "5511998877002",
          status: "NEEDS_HUMAN",
          notes: "Cliente pedindo encaixe para hoje apos as 19h."
        },
        messages: [
          {
            direction: "INBOUND",
            source: "USER",
            content: "Tem encaixe para corte e barba hoje a noite?"
          },
          {
            direction: "OUTBOUND",
            source: "BOT",
            content: "Posso verificar um encaixe apos as 19h com a equipe. Vou encaminhar para atendimento humano."
          }
        ]
      }
    ]
  },
  {
    owner: {
      name: "Demo Aurora Store",
      email: "demo+aurora@zappilot.local"
    },
    business: {
      name: "Aurora Store",
      slug: "demo-aurora-store",
      niche: "Loja de roupas",
      address: "Av. Paulista, 900 - Sao Paulo",
      phone: "(11) 4002-1003",
      whatsappNumber: "551140021003",
      businessHoursJson: "Seg a Sab, 10h as 22h",
      welcomeMessage: "Ola. Aqui e a Aurora Store. Posso te mostrar pecas, tamanhos e condicoes de entrega.",
      closedMessage: "No momento a loja esta fechada, mas sua solicitacao ja ficou registrada.",
      tone: "Consultivo, comercial e objetivo"
    },
    subscription: {
      planId: "plan_pro",
      status: "ACTIVE"
    },
    whatsappConfig: {
      metaBusinessAccountId: "",
      metaPhoneNumberId: "",
      metaAppId: "",
      verifyToken: "",
      accessToken: "",
      webhookStatus: "mock",
      isActive: false
    },
    products: [
      {
        name: "Vestido midi canelado",
        description: "Vestido casual premium com modelagem ajustada.",
        price: "149,90",
        sortOrder: 1
      },
      {
        name: "Camisa oversized linho",
        description: "Camisa leve para colecao feminina casual chic.",
        price: "119,90",
        sortOrder: 2
      }
    ],
    faqs: [
      {
        question: "Vocês trocam presente?",
        answer: "Sim. A troca pode ser feita em ate 30 dias com etiqueta e nota.",
        sortOrder: 1
      },
      {
        question: "Tem entrega para todo o Brasil?",
        answer: "Sim. O frete e calculado no fechamento da compra.",
        sortOrder: 2
      }
    ],
    conversations: [
      {
        contactName: "Beatriz Melo",
        contactPhone: "5511998877003",
        status: "OPEN",
        lead: {
          name: "Beatriz Melo",
          phone: "5511998877003",
          status: "QUALIFIED",
          notes: "Lead interessado em look para evento corporativo."
        },
        messages: [
          {
            direction: "INBOUND",
            source: "USER",
            content: "Vocês tem vestido midi no tamanho M?"
          },
          {
            direction: "OUTBOUND",
            source: "BOT",
            content: "Temos sim o vestido midi canelado no tamanho M por R$ 149,90."
          }
        ]
      }
    ]
  }
];

async function upsertPlans() {
  for (const plan of PLAN_CATALOG) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: {
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        description: plan.description,
        featuresJson: JSON.stringify(plan.features),
        isActive: true
      },
      create: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        description: plan.description,
        featuresJson: JSON.stringify(plan.features),
        isActive: true
      }
    });
  }
}

async function deleteExistingDemoTenants() {
  const slugs = DEMO_SEED_TENANTS.map((tenant) => tenant.business.slug);
  const emails = DEMO_SEED_TENANTS.map((tenant) => tenant.owner.email);

  await prisma.business.deleteMany({
    where: {
      slug: {
        in: slugs
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails
      }
    }
  });
}

async function createDemoTenant(tenant: DemoSeedTenant, passwordHash: string) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const owner = await prisma.user.create({
    data: {
      name: tenant.owner.name,
      email: tenant.owner.email,
      passwordHash
    }
  });

  const business = await prisma.business.create({
    data: {
      ownerUserId: owner.id,
      name: tenant.business.name,
      slug: tenant.business.slug,
      niche: tenant.business.niche,
      address: tenant.business.address,
      phone: tenant.business.phone,
      whatsappNumber: tenant.business.whatsappNumber,
      businessHoursJson: tenant.business.businessHoursJson,
      welcomeMessage: tenant.business.welcomeMessage,
      closedMessage: tenant.business.closedMessage,
      tone: tenant.business.tone,
      isOnboardingComplete: true
    }
  });

  await prisma.subscription.create({
    data: {
      businessId: business.id,
      planId: tenant.subscription.planId,
      status: tenant.subscription.status,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      activatedAt: now
    }
  });

  await prisma.whatsAppConfig.create({
    data: {
      businessId: business.id,
      ...tenant.whatsappConfig
    }
  });

  await prisma.product.createMany({
    data: tenant.products.map((product) => ({
      businessId: business.id,
      ...product,
      isActive: true
    }))
  });

  await prisma.fAQ.createMany({
    data: tenant.faqs.map((faq) => ({
      businessId: business.id,
      ...faq
    }))
  });

  for (const conversationSeed of tenant.conversations) {
    const conversation = await prisma.conversation.create({
      data: {
        businessId: business.id,
        contactName: conversationSeed.contactName,
        contactPhone: conversationSeed.contactPhone,
        status: conversationSeed.status
      }
    });

    await prisma.lead.create({
      data: {
        businessId: business.id,
        conversationId: conversation.id,
        name: conversationSeed.lead.name,
        phone: conversationSeed.lead.phone,
        notes: conversationSeed.lead.notes,
        status: conversationSeed.lead.status
      }
    });

    await prisma.message.createMany({
      data: conversationSeed.messages.map((message) => ({
        businessId: business.id,
        conversationId: conversation.id,
        direction: message.direction,
        source: message.source,
        content: message.content
      }))
    });
  }
}

export async function runDemoSeed() {
  await upsertPlans();
  await deleteExistingDemoTenants();

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  for (const tenant of DEMO_SEED_TENANTS) {
    await createDemoTenant(tenant, passwordHash);
  }
}

async function main() {
  await runDemoSeed();
}

const currentFile = fileURLToPath(import.meta.url);
const executedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFile === executedFile) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
