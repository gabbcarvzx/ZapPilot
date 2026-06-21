import { NextResponse } from "next/server";

import { env, envFlags, getEnvironmentValidationItems, getMissingRequiredProductionEnvs } from "@/lib/env";
import { getRequestId, logInfo, logWarn } from "@/lib/logger";
import { getSystemOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";

function isAuthorized(request: Request) {
  if (!env.systemValidateKey) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-system-validate-key")?.trim() === env.systemValidateKey;
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  if (!isAuthorized(request)) {
    logWarn("system.validate.unauthorized", { requestId });
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const diagnostics = await getSystemOperationalDiagnostics();
  const envItems = getEnvironmentValidationItems();
  const missingRequired = getMissingRequiredProductionEnvs();
  const mockDependencies = [
    diagnostics.database.mode === "Mock" || diagnostics.database.mode === "Not integrated yet" ? "database" : null,
    diagnostics.whatsapp.mode === "Mock" || diagnostics.whatsapp.mode === "Not integrated yet" ? "whatsapp" : null,
    diagnostics.gemini.mode === "Mock" || diagnostics.gemini.mode === "Not integrated yet" ? "gemini" : null,
    diagnostics.billing.mode === "Mock" || diagnostics.billing.mode === "Not integrated yet" ? "billing" : null
  ].filter((item): item is string => Boolean(item));
  const status =
    missingRequired.length > 0
      ? "blocked"
      : mockDependencies.length > 0
        ? "degraded"
        : "ok";

  logInfo("system.validate.completed", {
    requestId,
    metadata: {
      status,
      missingRequiredCount: missingRequired.length,
      mockDependencies
    }
  });

  return NextResponse.json({
    status,
    environment: process.env.NODE_ENV ?? "development",
    mockModeEnabled: envFlags.mockModeEnabled,
    missingRequiredProductionEnvs: missingRequired,
    env: envItems,
    diagnostics,
    warnings:
      mockDependencies.length > 0
        ? ["Existem dependencias ainda operando em modo mock ou nao configurado."]
        : []
  });
}
