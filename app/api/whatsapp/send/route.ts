import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createOutboundMessage } from "@/server/services/message-service";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const provider = await sendWhatsAppMessage({
    phone: body.phone,
    content: body.content
  });

  const saved = await createOutboundMessage({
    businessId: session.user.businessId,
    phone: body.phone,
    content: body.content,
    conversationId: body.conversationId,
    contactName: body.contactName
  });

  return NextResponse.json({ provider, saved });
}
