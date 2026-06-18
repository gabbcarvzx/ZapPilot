import { mockStore } from "@/lib/mock-store";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/server/validators/messaging";

export async function listMessagesForBusiness(businessId: string) {
  if (prisma) {
    return prisma.conversation.findMany({
      where: { businessId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" }
        }
      },
      orderBy: { lastMessageAt: "desc" }
    });
  }

  return mockStore.conversations
    .filter((item) => item.businessId === businessId)
    .map((conversation) => ({
      ...conversation,
      messages: mockStore.messages.filter((message) => message.conversationId === conversation.id)
    }));
}

export async function createOutboundMessage(input: unknown) {
  const values = sendMessageSchema.parse(input);

  if (prisma) {
    const conversation =
      values.conversationId
        ? await prisma.conversation.findUnique({
            where: { id: values.conversationId }
          })
        : await prisma.conversation.create({
            data: {
              businessId: values.businessId,
              contactPhone: values.phone,
              contactName: values.contactName ?? ""
            }
          });

    if (!conversation) return null;

    const message = await prisma.message.create({
      data: {
        businessId: values.businessId,
        conversationId: conversation.id,
        direction: "OUTBOUND",
        source: "BOT",
        content: values.content
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date()
      }
    });

    return { conversation, message };
  }

  let conversation = values.conversationId
    ? mockStore.conversations.find((item) => item.id === values.conversationId)
    : mockStore.conversations.find(
        (item) => item.businessId === values.businessId && item.contactPhone === values.phone
      );

  if (!conversation) {
    conversation = {
      id: mockStore.createId("conv"),
      businessId: values.businessId,
      contactPhone: values.phone,
      contactName: values.contactName ?? "",
      status: "OPEN",
      lastMessageAt: mockStore.now(),
      leadId: null,
      createdAt: mockStore.now(),
      updatedAt: mockStore.now()
    };
    mockStore.conversations.push(conversation);
  }

  const message = {
    id: mockStore.createId("msg"),
    businessId: values.businessId,
    conversationId: conversation.id,
    direction: "OUTBOUND" as const,
    source: "BOT" as const,
    content: values.content,
    metaJson: "{}",
    sentAt: mockStore.now(),
    createdAt: mockStore.now()
  };

  mockStore.messages.push(message);
  conversation.lastMessageAt = mockStore.now();
  conversation.updatedAt = mockStore.now();
  return { conversation, message };
}
