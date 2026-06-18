import { env, envFlags } from "@/lib/env";

interface SendWhatsAppMessageInput {
  phone: string;
  content: string;
}

export async function sendWhatsAppMessage(input: SendWhatsAppMessageInput) {
  if (!envFlags.whatsappLive) {
    return {
      ok: true,
      mode: "mock" as const,
      providerMessageId: `mock_${Date.now()}`,
      payload: input
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${env.whatsappPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.whatsappAccessToken}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.phone,
        type: "text",
        text: {
          body: input.content
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${errorText}`);
  }

  const data = await response.json();

  return {
    ok: true,
    mode: "live" as const,
    providerMessageId: data.messages?.[0]?.id ?? ""
  };
}
