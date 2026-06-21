import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getRequestId, logError, logInfo, logWarn } from "@/lib/logger";
import { createOutboundMessage } from "@/server/services/message-service";
import { getWhatsAppConfigForBusiness } from "@/server/services/business-service";
import { guardPaidFeatureAccess } from "@/server/guards/paid-feature-guard";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user?.businessId) {
    logWarn("whatsapp.send.rejected", {
      requestId,
      metadata: {
        reason: "unauthorized"
      }
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const subscription = await getSubscriptionForBusiness(session.user.businessId);
    const access = guardPaidFeatureAccess({
      subscriptionStatus: subscription?.status,
      resource: "real_whatsapp_send"
    });

    if (!access.ok) {
      logWarn("whatsapp.send.blocked_by_plan", {
        businessId: session.user.businessId,
        userId: session.user.id,
        requestId,
        metadata: {
          subscriptionStatus: subscription?.status ?? "PENDING"
        }
      });

      return NextResponse.json({ error: access.message }, { status: access.httpStatus });
    }

    const config = await getWhatsAppConfigForBusiness(session.user.businessId);
    const provider = await sendWhatsAppMessage({
      phone: body.phone,
      content: body.content,
      credentials:
        config?.accessToken && config.metaPhoneNumberId
          ? {
              accessToken: config.accessToken,
              phoneNumberId: config.metaPhoneNumberId
            }
          : undefined
    });

    const saved = await createOutboundMessage({
      businessId: session.user.businessId,
      phone: body.phone,
      content: body.content,
      conversationId: body.conversationId,
      contactName: body.contactName
    });

    logInfo("whatsapp.send.completed", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId,
      metadata: {
        providerMode: provider.mode,
        usedTenantCredentials: Boolean(config?.accessToken && config.metaPhoneNumberId)
      }
    });

    return NextResponse.json({ provider, saved });
  } catch (error) {
    logError("whatsapp.send.failed", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId,
      metadata: {
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel enviar a mensagem."
      },
      { status: 400 }
    );
  }
}
