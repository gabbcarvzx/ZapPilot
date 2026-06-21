import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { replaceFaqs } from "@/server/services/business-service";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await replaceFaqs(session.user.businessId, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel salvar as FAQs."
      },
      { status: 400 }
    );
  }
}
