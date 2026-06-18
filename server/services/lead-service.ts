import { mockStore } from "@/lib/mock-store";
import { prisma } from "@/lib/prisma";

export async function createLeadIfNeeded(businessId: string, phone: string, notes: string) {
  if (prisma) {
    const existing = await prisma.lead.findFirst({
      where: { businessId, phone }
    });

    if (existing) {
      return prisma.lead.update({
        where: { id: existing.id },
        data: {
          notes,
          status: "NEEDS_HUMAN"
        }
      });
    }

    return prisma.lead.create({
      data: {
        businessId,
        phone,
        notes,
        status: "NEEDS_HUMAN"
      }
    });
  }

  const existing = mockStore.leads.find((item) => item.businessId === businessId && item.phone === phone);
  if (existing) {
    existing.notes = notes;
    existing.status = "NEEDS_HUMAN";
    existing.updatedAt = mockStore.now();
    return existing;
  }

  const lead = {
    id: mockStore.createId("lead"),
    businessId,
    conversationId: null,
    name: "",
    phone,
    notes,
    status: "NEEDS_HUMAN" as const,
    createdAt: mockStore.now(),
    updatedAt: mockStore.now()
  };
  mockStore.leads.push(lead);
  return lead;
}

export async function markConversationNeedsHuman(businessId: string, phone: string) {
  if (prisma) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        businessId,
        contactPhone: phone
      }
    });

    if (!conversation) return null;

    return prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: "NEEDS_HUMAN" }
    });
  }

  const conversation = mockStore.conversations.find(
    (item) => item.businessId === businessId && item.contactPhone === phone
  );

  if (!conversation) return null;
  conversation.status = "NEEDS_HUMAN";
  conversation.updatedAt = mockStore.now();
  return conversation;
}
