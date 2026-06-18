import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { replaceProducts } from "@/server/services/business-service";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await replaceProducts(session.user.businessId, body);
  return NextResponse.json(result);
}
