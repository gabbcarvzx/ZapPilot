import { NextResponse } from "next/server";

import { buildAssistantReply } from "@/server/services/assistant-service";
import { receiveInboundMessage } from "@/server/services/whatsapp-service";
import { simulateMessageSchema } from "@/server/validators/messaging";

export async function POST(request: Request) {
  const body = simulateMessageSchema.parse(await request.json());
  await receiveInboundMessage(body.businessId, body.phone, body.contactName, body.content);
  const assistant = await buildAssistantReply(body.businessId, body.content, body.phone);
  return NextResponse.json(assistant);
}
