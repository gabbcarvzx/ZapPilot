import { env, envFlags } from "@/lib/env";

interface SendWhatsAppMessageInput {
  phone: string;
  content: string;
  credentials?: {
    accessToken: string;
    phoneNumberId: string;
  };
}

function resolveLiveCredentials(input: SendWhatsAppMessageInput) {
  const tenantAccessToken = input.credentials?.accessToken?.trim() ?? "";
  const tenantPhoneNumberId = input.credentials?.phoneNumberId?.trim() ?? "";

  if (tenantAccessToken && tenantPhoneNumberId) {
    return {
      accessToken: tenantAccessToken,
      phoneNumberId: tenantPhoneNumberId
    };
  }

  if (envFlags.whatsappLive) {
    return {
      accessToken: env.whatsappAccessToken,
      phoneNumberId: env.whatsappPhoneNumberId
    };
  }

  return null;
}

export async function sendWhatsAppMessage(input: SendWhatsAppMessageInput) {
  const liveCredentials = resolveLiveCredentials(input);

  if (!liveCredentials) {
    if (!envFlags.mockModeEnabled) {
      throw new Error("WhatsApp nao configurado e mock desabilitado.");
    }

    return {
      ok: true,
      mode: "mock" as const,
      providerMessageId: `mock_${Date.now()}`,
      payload: input
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${liveCredentials.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${liveCredentials.accessToken}`
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
