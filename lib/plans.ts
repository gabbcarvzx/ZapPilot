import { PlanRecord } from "@/types/domain";

export const PLAN_CATALOG: PlanRecord[] = [
  {
    id: "plan_start",
    code: "START",
    name: "Start",
    priceCents: 4900,
    currency: "BRL",
    description: "Automatize o básico do atendimento e organize seu primeiro fluxo comercial.",
    features: [
      "Respostas automáticas simples",
      "Horário de funcionamento",
      "Catálogo básico",
      "Chamar atendimento humano"
    ],
    isActive: true
  },
  {
    id: "plan_pro",
    code: "PRO",
    name: "Pro",
    priceCents: 9700,
    currency: "BRL",
    description: "Adicione IA, capture leads e acompanhe conversas para vender mais.",
    features: [
      "Tudo do Start",
      "IA com Gemini",
      "Captura de leads",
      "Histórico de conversas",
      "Personalização por nicho"
    ],
    isActive: true
  },
  {
    id: "plan_premium",
    code: "PREMIUM",
    name: "Premium",
    priceCents: 19700,
    currency: "BRL",
    description: "Operação avançada para negócios com mais volume e processo comercial.",
    features: [
      "Tudo do Pro",
      "Múltiplos atendentes",
      "Funil de vendas",
      "Relatórios",
      "Configuração avançada"
    ],
    isActive: true
  }
];
