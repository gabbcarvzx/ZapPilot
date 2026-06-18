import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createAccount, updateBusiness, updateWhatsAppConfig } from "@/server/services/business-service";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createAccount(body);
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await updateBusiness(session.user.businessId, body);
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await updateWhatsAppConfig(session.user.businessId, body);
  return NextResponse.json(result);
}
