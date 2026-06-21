import { mockStore } from "@/lib/mock-store";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildAssistantReply } from "@/server/services/assistant-service";
import { getWhatsAppConfigForBusiness } from "@/server/services/business-service";
import { createOutboundMessage } from "@/server/services/message-service";
import { isSubscriptionActive } from "@/server/services/subscription-service";

export async function receiveInboundMessage(
  businessId: string,
  phone: string,
  contactName: string,
  content: string
) {
  let conversationId = "";

  if (prisma) {
    let conversation = await prisma.conversation.findFirst({
      where: { businessId, contactPhone: phone }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId,
          contactPhone: phone,
          contactName
        }
      });
    }

    conversationId = conversation.id;

    await prisma.message.create({
      data: {
        businessId,
        conversationId,
        direction: "INBOUND",
        source: "USER",
        content
      }
    });
  } else {
    let conversation = mockStore.conversations.find(
      (item) => item.businessId === businessId && item.contactPhone === phone
    );
    if (!conversation) {
      conversation = {
        id: mockStore.createId("conv"),
        businessId,
        contactPhone: phone,
        contactName,
        status: "OPEN",
        lastMessageAt: mockStore.now(),
        leadId: null,
        createdAt: mockStore.now(),
        updatedAt: mockStore.now()
      };
      mockStore.conversations.push(conversation);
    }
    conversationId = conversation.id;
    mockStore.messages.push({
      id: mockStore.createId("msg"),
      businessId,
      conversationId,
      direction: "INBOUND",
      source: "USER",
      content,
      metaJson: "{}",
      sentAt: mockStore.now(),
      createdAt: mockStore.now()
    });
  }

  const active = await isSubscriptionActive(businessId);
  if (!active) {
    return {
      status: "inactive_plan",
      conversationId
    };
  }

  const assistant = await buildAssistantReply(businessId, content, phone);
  const config = await getWhatsAppConfigForBusiness(businessId);
  await sendWhatsAppMessage({
    phone,
    content: assistant.reply,
    credentials:
      config?.accessToken && config?.metaPhoneNumberId
        ? {
            accessToken: config.accessToken,
            phoneNumberId: config.metaPhoneNumberId
          }
        : undefined
  });
  await createOutboundMessage({ businessId, phone, content: assistant.reply, conversationId, contactName });

  return {
    status: "answered",
    conversationId,
    reply: assistant.reply
  };
}
