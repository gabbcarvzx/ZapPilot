import { NextResponse } from "next/server";

import { receiveInboundMessage } from "@/server/services/whatsapp-service";
import { simulateMessageSchema } from "@/server/validators/messaging";

export async function POST(request: Request) {
  try {
    const body = simulateMessageSchema.parse(await request.json());
    const result = await receiveInboundMessage(body.businessId, body.phone, body.contactName, body.content);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel simular a mensagem."
      },
      { status: 400 }
    );
  }
}
