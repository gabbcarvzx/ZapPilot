import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getRequestId, logError, logInfo, logWarn } from "@/lib/logger";
import { guardPaidFeatureAccess } from "@/server/guards/paid-feature-guard";
import { createAccount, updateBusiness, updateWhatsAppConfig } from "@/server/services/business-service";
import { getSubscriptionForBusiness } from "@/server/services/subscription-service";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  try {
    const body = await request.json();
    const result = await createAccount(body);
    logInfo("onboarding.account.created", {
      businessId: result.businessId,
      userId: result.userId,
      requestId
    });
    return NextResponse.json(result);
  } catch (error) {
    logError("onboarding.account.create_failed", {
      requestId,
      metadata: {
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel criar a conta."
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user?.businessId) {
    logWarn("business.update.rejected", {
      requestId,
      metadata: {
        reason: "unauthorized"
      }
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await updateBusiness(session.user.businessId, body);
    logInfo("onboarding.business.updated", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId
    });
    return NextResponse.json(result);
  } catch (error) {
    logError("onboarding.business.update_failed", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId,
      metadata: {
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel salvar os dados da empresa."
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const requestId = getRequestId(request);
  const session = await auth();
  if (!session?.user?.businessId) {
    logWarn("integrations.whatsapp.update_rejected", {
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
    const wantsActivation = Boolean(body?.isActive);

    if (wantsActivation) {
      const access = guardPaidFeatureAccess({
        subscriptionStatus: subscription?.status,
        resource: "real_whatsapp_activation"
      });

      if (!access.ok) {
        logWarn("integrations.whatsapp.activation_blocked", {
          businessId: session.user.businessId,
          userId: session.user.id,
          requestId,
          metadata: {
            subscriptionStatus: subscription?.status ?? "PENDING"
          }
        });

        return NextResponse.json({ error: access.message }, { status: access.httpStatus });
      }
    }

    const result = await updateWhatsAppConfig(session.user.businessId, body);
    logInfo("integrations.whatsapp.updated", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId
    });
    return NextResponse.json(result);
  } catch (error) {
    logError("integrations.whatsapp.update_failed", {
      businessId: session.user.businessId,
      userId: session.user.id,
      requestId,
      metadata: {
        message: error instanceof Error ? error.message : "unknown_error"
      }
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao do WhatsApp."
      },
      { status: 400 }
    );
  }
}
