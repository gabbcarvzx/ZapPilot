import { getPaidFeaturePolicy, type PaidSubscriptionStatus } from "@/server/policies/paid-feature-policy";

export type PaidFeatureResource = "real_automation" | "real_whatsapp_send" | "real_whatsapp_activation";

interface PaidFeatureGuardInput {
  subscriptionStatus: PaidSubscriptionStatus;
  resource: PaidFeatureResource;
}

interface PaidFeatureGuardAllowed {
  ok: true;
  httpStatus: 200;
}

interface PaidFeatureGuardBlocked {
  ok: false;
  httpStatus: 402;
  message: string;
}

export type PaidFeatureGuardResult = PaidFeatureGuardAllowed | PaidFeatureGuardBlocked;

function resolveBlockedMessage(input: PaidFeatureGuardInput) {
  const policy = getPaidFeaturePolicy(input.subscriptionStatus);

  if (input.resource === "real_whatsapp_send") {
    if (policy.subscriptionStatus === "PENDING") {
      return "O envio real fica disponivel somente apos a confirmacao do pagamento.";
    }

    if (policy.subscriptionStatus === "EXPIRED") {
      return "O envio real fica bloqueado porque o plano expirou e precisa ser regularizado.";
    }

    if (policy.subscriptionStatus === "CANCELED") {
      return "O envio real fica bloqueado porque o plano foi cancelado.";
    }
  }

  if (policy.subscriptionStatus === "PENDING") {
    return "O recurso pago fica disponivel somente apos a confirmacao do pagamento.";
  }

  if (policy.subscriptionStatus === "EXPIRED") {
    return "O recurso pago fica bloqueado porque o plano expirou e precisa ser regularizado.";
  }

  if (policy.subscriptionStatus === "CANCELED") {
    return "O recurso pago fica bloqueado porque o plano foi cancelado.";
  }

  return "O recurso pago nao esta liberado para a conta atual.";
}

export function guardPaidFeatureAccess(input: PaidFeatureGuardInput): PaidFeatureGuardResult {
  const policy = getPaidFeaturePolicy(input.subscriptionStatus);

  const allowed =
    input.resource === "real_automation"
      ? policy.canUseRealAutomation
      : input.resource === "real_whatsapp_send"
        ? policy.canSendRealWhatsApp
        : policy.canActivateRealConnection;

  if (allowed) {
    return {
      ok: true,
      httpStatus: 200
    };
  }

  return {
    ok: false,
    httpStatus: 402,
    message: resolveBlockedMessage(input)
  };
}
