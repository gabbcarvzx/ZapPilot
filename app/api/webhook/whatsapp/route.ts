import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { receiveInboundMessage } from "@/server/services/whatsapp-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.whatsappWebhookVerifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  if (!env.whatsappWebhookVerifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid verification" }, { status: 403 });
}

export async function POST(request: Request) {
  const payload = await request.json();

  const change = payload.entry?.[0]?.changes?.[0]?.value;
  const message = change?.messages?.[0];
  const metadata = change?.metadata;

  if (!message) {
    return NextResponse.json({ received: true, mode: "noop" });
  }

  const businessId =
    metadata?.phone_number_id === "mock"
      ? "biz_demo"
      : "biz_demo";

  const result = await receiveInboundMessage(
    businessId,
    message.from,
    change?.contacts?.[0]?.profile?.name ?? "Contato",
    message.text?.body ?? ""
  );

  return NextResponse.json({ received: true, result });
}
