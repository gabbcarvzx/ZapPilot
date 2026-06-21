export type PaidSubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED" | null | undefined;

export interface PaidFeaturePolicy {
  subscriptionStatus: "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";
  commercialStatus: "active" | "pending" | "expired" | "canceled";
  canUseRealAutomation: boolean;
  canSendRealWhatsApp: boolean;
  canActivateRealConnection: boolean;
  canAccessBasicConfiguration: boolean;
  userMessageTitle: string;
  userMessageDetail: string;
  userNextStep: string;
}

export function getPaidFeaturePolicy(subscriptionStatus: PaidSubscriptionStatus): PaidFeaturePolicy {
  if (subscriptionStatus === "ACTIVE") {
    return {
      subscriptionStatus: "ACTIVE",
      commercialStatus: "active",
      canUseRealAutomation: true,
      canSendRealWhatsApp: true,
      canActivateRealConnection: true,
      canAccessBasicConfiguration: true,
      userMessageTitle: "Plano ativo",
      userMessageDetail: "Plano ativo e liberado para operacao real.",
      userNextStep: "Seguir com ativacao, testes reais e operacao comercial."
    };
  }

  if (subscriptionStatus === "EXPIRED") {
    return {
      subscriptionStatus: "EXPIRED",
      commercialStatus: "expired",
      canUseRealAutomation: false,
      canSendRealWhatsApp: false,
      canActivateRealConnection: false,
      canAccessBasicConfiguration: true,
      userMessageTitle: "Plano expirado",
      userMessageDetail: "Pagamento vencido. A conta existe, mas a automacao real continua bloqueada ate a regularizacao.",
      userNextStep: "Regularizar o plano antes de liberar novas respostas automaticas."
    };
  }

  if (subscriptionStatus === "CANCELED") {
    return {
      subscriptionStatus: "CANCELED",
      commercialStatus: "canceled",
      canUseRealAutomation: false,
      canSendRealWhatsApp: false,
      canActivateRealConnection: false,
      canAccessBasicConfiguration: true,
      userMessageTitle: "Plano cancelado",
      userMessageDetail: "Assinatura cancelada. A conta permanece acessivel, mas a operacao automatica fica bloqueada.",
      userNextStep: "Regularizar o plano antes de liberar novas respostas automaticas."
    };
  }

  return {
    subscriptionStatus: "PENDING",
    commercialStatus: "pending",
    canUseRealAutomation: false,
    canSendRealWhatsApp: false,
    canActivateRealConnection: false,
    canAccessBasicConfiguration: true,
    userMessageTitle: "Pagamento pendente",
    userMessageDetail: "Conta criada, pagamento pendente e automacao bloqueada ate a confirmacao do plano.",
    userNextStep: "Concluir a configuracao basica agora e retomar o pagamento para liberar o atendimento automatico."
  };
}
