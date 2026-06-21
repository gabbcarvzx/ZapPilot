import { PlanRecord } from "@/types/domain";

export const PLAN_CATALOG: PlanRecord[] = [
  {
    id: "plan_start",
    code: "START",
    name: "Start",
    priceCents: 4900,
    currency: "BRL",
    description: "Automatize o basico do atendimento e organize seu primeiro fluxo comercial.",
    features: ["Respostas automaticas simples", "Horario de funcionamento", "Catalogo basico", "Chamar atendimento humano"],
    isActive: true
  },
  {
    id: "plan_pro",
    code: "PRO",
    name: "Pro",
    priceCents: 9700,
    currency: "BRL",
    description: "Adicione IA, capture leads e acompanhe conversas para vender mais.",
    features: ["Tudo do Start", "IA com Gemini", "Captura de leads", "Historico de conversas", "Personalizacao por nicho"],
    isActive: true
  },
  {
    id: "plan_premium",
    code: "PREMIUM",
    name: "Premium",
    priceCents: 19700,
    currency: "BRL",
    description: "Operacao avancada para negocios com mais volume e processo comercial.",
    features: ["Tudo do Pro", "Multiplos atendentes", "Funil de vendas", "Relatorios", "Configuracao avancada"],
    isActive: true
  }
];
