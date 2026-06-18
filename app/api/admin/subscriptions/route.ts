import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { updateSubscription } from "@/server/services/subscription-service";

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const result = await updateSubscription(body);
  return NextResponse.json(result);
}
