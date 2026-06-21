import { NextResponse } from "next/server";

import { getRequestId, logError, logInfo, logWarn } from "@/lib/logger";
import {
  InvalidWebhookPayloadError,
  UnauthorizedWebhookError,
  assertWebhookToken,
  handleAsaasWebhook
} from "@/server/services/billing-service";

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    assertWebhookToken(request.headers.get("asaas-access-token"));

    const body = await request.json();
    const result = await handleAsaasWebhook(body, { requestId });
    logInfo("billing.webhook.response_ready", {
      requestId,
      metadata: {
        event: typeof body === "object" && body && "event" in body ? body.event : null,
        eventId: typeof body === "object" && body && "id" in body ? body.id : null,
        status: result.status
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedWebhookError) {
      logWarn("billing.webhook.unauthorized", { requestId });
      return NextResponse.json({ error: "Webhook nao autorizado." }, { status: 401 });
    }

    if (error instanceof InvalidWebhookPayloadError) {
      logWarn("billing.webhook.invalid_payload", { requestId });
      return NextResponse.json({ error: "Payload de webhook invalido." }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      logWarn("billing.webhook.invalid_json", { requestId });
      return NextResponse.json({ error: "Payload de webhook invalido." }, { status: 400 });
    }

    logError("billing.webhook.unexpected_error", {
      requestId,
      metadata: {
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });
    return NextResponse.json({ error: "Falha inesperada ao processar webhook." }, { status: 500 });
  }
}
