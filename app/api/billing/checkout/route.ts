import { NextResponse } from "next/server";

import { getRequestId, logError, logInfo, logWarn } from "@/lib/logger";
import { startCheckout } from "@/server/services/billing-service";
import { checkoutInputSchema } from "@/server/validators/billing";

function buildCheckoutResponse(result: {
  redirectTo: string;
  subscription: {
    status: string;
    paymentStatus?: string | null;
    checkoutUrl?: string | null;
  };
}) {
  return {
    checkoutUrl: result.subscription.checkoutUrl ?? null,
    subscriptionStatus: result.subscription.status,
    paymentStatus: result.subscription.paymentStatus ?? null,
    redirectTo: result.redirectTo
  };
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const body = await request.json();
    const parsed = checkoutInputSchema.safeParse(body);

    if (!parsed.success) {
      logWarn("billing.checkout.request_invalid", {
        requestId,
        metadata: {
          issues: parsed.error.issues.map((issue) => issue.path.join("."))
        }
      });
      return NextResponse.json({ error: "Dados de checkout invalidos." }, { status: 400 });
    }

    const result = await startCheckout(parsed.data, { requestId });
    logInfo("billing.checkout.response_ready", {
      requestId,
      metadata: {
        subscriptionStatus: result.subscription.status,
        paymentStatus: result.subscription.paymentStatus ?? null
      }
    });
    return NextResponse.json(buildCheckoutResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "Plano invalido." || message === "Dados de checkout invalidos.") {
      return NextResponse.json({ error: "Dados de checkout invalidos." }, { status: 400 });
    }

    if (message === "Nao foi possivel iniciar o checkout agora.") {
      logError("billing.checkout.gateway_failed", {
        requestId,
        metadata: {
          message
        }
      });
      return NextResponse.json({ error: message }, { status: 502 });
    }

    logError("billing.checkout.unexpected_error", {
      requestId,
      metadata: {
        message
      }
    });
    return NextResponse.json({ error: "Falha inesperada ao iniciar checkout." }, { status: 500 });
  }
}
