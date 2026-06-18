import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2),
  niche: z.string().min(2),
  address: z.string().default(""),
  phone: z.string().default(""),
  whatsappNumber: z.string().default(""),
  businessHours: z.string().default(""),
  welcomeMessage: z.string().default(""),
  closedMessage: z.string().default(""),
  tone: z.string().default("Profissional, simples, direto e comercial"),
  isOnboardingComplete: z.boolean().optional()
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().default(""),
  price: z.string().default(""),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0)
});

export const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  sortOrder: z.number().default(0)
});

export const whatsappConfigSchema = z.object({
  metaBusinessAccountId: z.string().default(""),
  metaPhoneNumberId: z.string().default(""),
  metaAppId: z.string().default(""),
  verifyToken: z.string().default(""),
  accessToken: z.string().default(""),
  isActive: z.boolean().default(false)
});
