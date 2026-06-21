import { NextResponse } from "next/server";

import { getRequestId, logInfo } from "@/lib/logger";
import { getSystemOperationalDiagnostics } from "@/server/services/operational-diagnostics-service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const diagnostics = await getSystemOperationalDiagnostics();
  const hasBlockingIssue = diagnostics.database.status === "blocked" || diagnostics.auth.status === "blocked";
  const status = hasBlockingIssue ? "degraded" : "ok";

  logInfo("health.check.completed", {
    requestId,
    metadata: {
      status,
      databaseStatus: diagnostics.database.status,
      authStatus: diagnostics.auth.status,
      whatsappStatus: diagnostics.whatsapp.status,
      billingStatus: diagnostics.billing.status
    }
  });

  return NextResponse.json(
    {
      status,
      ...diagnostics
    },
    {
      status: 200
    }
  );
}
