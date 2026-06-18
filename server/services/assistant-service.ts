import { generateBusinessReply } from "@/lib/gemini";
import { isBusinessOpen } from "@/lib/utils";
import { getBusinessSnapshot } from "@/server/services/business-service";
import { createLeadIfNeeded, markConversationNeedsHuman } from "@/server/services/lead-service";

export async function buildAssistantReply(businessId: string, latestCustomerMessage: string, phone: string) {
  const snapshot = await getBusinessSnapshot(businessId);
  if (!snapshot) {
    return {
      reply: "Não encontrei a configuração deste negócio. Vou encaminhar para atendimento humano.",
      needsHuman: true
    };
  }

  const businessHours =
    "businessHoursJson" in snapshot ? snapshot.businessHoursJson : snapshot.businessHours;

  if (!isBusinessOpen(businessHours)) {
    return {
      reply: snapshot.closedMessage,
      needsHuman: false
    };
  }

  const reply = await generateBusinessReply({
    businessName: snapshot.name,
    niche: snapshot.niche,
    businessHours: businessHours ?? "",
    products: snapshot.products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price
    })),
    faqs: snapshot.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer
    })),
    tone: snapshot.tone,
    welcomeMessage: snapshot.welcomeMessage,
    closedMessage: snapshot.closedMessage,
    latestCustomerMessage
  });

  const needsHuman = /encaminhar|atendente humano/i.test(reply);

  if (needsHuman) {
    await createLeadIfNeeded(businessId, phone, latestCustomerMessage);
    await markConversationNeedsHuman(businessId, phone);
  }

  return {
    reply,
    needsHuman
  };
}
