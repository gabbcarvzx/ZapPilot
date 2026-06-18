import { z } from "zod";

export const sendMessageSchema = z.object({
  businessId: z.string().min(1),
  conversationId: z.string().optional(),
  phone: z.string().min(8),
  content: z.string().min(1),
  contactName: z.string().optional()
});

export const simulateMessageSchema = z.object({
  businessId: z.string().min(1),
  phone: z.string().min(8),
  content: z.string().min(1),
  contactName: z.string().default("Lead Local")
});
