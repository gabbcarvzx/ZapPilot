import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getRequestId, logInfo, logWarn } from "@/lib/logger";
import { resolveBusinessIdByPhoneNumberId } from "@/server/services/business-service";
import { receiveInboundMessage } from "@/server/services/whatsapp-service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.whatsappWebhookVerifyToken) {
    logInfo("whatsapp.webhook.verified", {
      requestId,
      metadata: {
        mode
      }
    });
    return new Response(challenge ?? "", { status: 200 });
  }

  if (!env.whatsappWebhookVerifyToken && challenge) {
    logWarn("whatsapp.webhook.verify_fallback", {
      requestId,
      metadata: {
        mode
      }
    });
    return new Response(challenge, { status: 200 });
  }

  logWarn("whatsapp.webhook.verify_rejected", {
    requestId,
    metadata: {
      mode
    }
  });
  return NextResponse.json({ error: "Invalid verification" }, { status: 403 });
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const payload = await request.json();

  const change = payload.entry?.[0]?.changes?.[0]?.value;
  const message = change?.messages?.[0];
  const metadata = change?.metadata;

  if (!message) {
    logInfo("whatsapp.webhook.noop", {
      requestId,
      metadata: {
        phoneNumberId: metadata?.phone_number_id ?? null
      }
    });
    return NextResponse.json({ received: true, mode: "noop" });
  }

  const businessId = await resolveBusinessIdByPhoneNumberId(metadata?.phone_number_id ?? "");
  if (!businessId) {
    logWarn("whatsapp.webhook.unknown_tenant", {
      requestId,
      metadata: {
        phoneNumberId: metadata?.phone_number_id ?? null
      }
    });
    return NextResponse.json(
      {
        error: "Unknown tenant for phone_number_id"
      },
      { status: 404 }
    );
  }

  const result = await receiveInboundMessage(
    businessId,
    message.from,
    change?.contacts?.[0]?.profile?.name ?? "Contato",
    message.text?.body ?? ""
  );

  logInfo("whatsapp.webhook.message_received", {
    businessId,
    requestId,
    metadata: {
      phoneNumberId: metadata?.phone_number_id ?? null,
      contactPhone: message.from,
      resultType: typeof result === "object" && result && "status" in result ? result.status : "processed"
    }
  });

  return NextResponse.json({ received: true, result });
}
