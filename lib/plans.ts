import { PlanCode, PlanRecord } from "@/types/domain";

export type PublicPlanSlug = "start" | "pro" | "premium";

interface PlanPresentation {
  slug: PublicPlanSlug;
  marketingName: string;
  badge: string;
  recommendedBadge?: string;
  messageLimit: string;
  heroLabel: string;
  includedLabel: string;
  ctaLabel: string;
  socialProof: string;
}

export const PLAN_CATALOG: PlanRecord[] = [
  {
    id: "plan_start",
    code: "START",
    name: "Starter",
    priceCents: 4900,
    currency: "BRL",
    description: "Estruture o atendimento inicial, teste a operacao e tire o WhatsApp do improviso.",
    features: [
      "Respostas automaticas essenciais",
      "Horario de funcionamento",
      "Catalogo basico",
      "Escalada para atendimento humano"
    ],
    isActive: true
  },
  {
    id: "plan_pro",
    code: "PRO",
    name: "Pro",
    priceCents: 9700,
    currency: "BRL",
    description: "A camada comercial completa para vender mais com IA, historico e operacao mais madura.",
    features: [
      "Tudo do Starter",
      "IA com Gemini",
      "Captura de leads",
      "Historico de conversas",
      "Personalizacao por nicho"
    ],
    isActive: true
  },
  {
    id: "plan_premium",
    code: "PREMIUM",
    name: "Business",
    priceCents: 19700,
    currency: "BRL",
    description: "Operacao avancada para times que precisam de mais volume, visibilidade e controle comercial.",
    features: ["Tudo do Pro", "Multiplos atendentes", "Funil de vendas", "Relatorios", "Configuracao avancada"],
    isActive: true
  }
];

const PLAN_SLUG_TO_CODE = {
  premium: "PREMIUM",
  pro: "PRO",
  start: "START"
} as const satisfies Record<PublicPlanSlug, PlanCode>;

const PLAN_PRESENTATION: Record<PlanCode, PlanPresentation> = {
  START: {
    slug: "start",
    marketingName: "Starter",
    badge: "Entrada mais rapida",
    messageLimit: "Ate 500 mensagens por mes",
    heroLabel: "Ideal para comecar com estrutura",
    includedLabel: "Inclui no plano",
    ctaLabel: "Comecar agora",
    socialProof: "Melhor para primeiros testes comerciais"
  },
  PRO: {
    slug: "pro",
    marketingName: "Pro",
    badge: "Melhor custo-beneficio",
    recommendedBadge: "Plano recomendado",
    messageLimit: "Ate 2.500 mensagens por mes",
    heroLabel: "Melhor equilibrio entre custo e venda",
    includedLabel: "Recursos de conversao",
    ctaLabel: "Comecar agora",
    socialProof: "Escolhido por operacoes que ja dependem de WhatsApp"
  },
  PREMIUM: {
    slug: "premium",
    marketingName: "Business",
    badge: "Escala com governanca",
    messageLimit: "Ate 10.000 mensagens por mes",
    heroLabel: "Para volume, equipe e processo comercial",
    includedLabel: "Estrutura para operacao madura",
    ctaLabel: "Comecar agora",
    socialProof: "Feito para empresas com maior volume de atendimento"
  }
};

export function getPlanBySlug(slug: string): PlanRecord | null {
  const normalizedSlug = slug.trim().toLowerCase();
  const planCode = PLAN_SLUG_TO_CODE[normalizedSlug as keyof typeof PLAN_SLUG_TO_CODE];

  if (!planCode) {
    return null;
  }

  return PLAN_CATALOG.find((plan) => plan.code === planCode) ?? null;
}

export function getPlanSlug(planCode: PlanCode): PublicPlanSlug {
  return PLAN_PRESENTATION[planCode].slug;
}

export function getPlanPresentation(planOrCode: PlanRecord | PlanCode): PlanPresentation {
  const code = typeof planOrCode === "string" ? planOrCode : planOrCode.code;
  return PLAN_PRESENTATION[code];
}
