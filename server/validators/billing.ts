import { z } from "zod";

export const checkoutInputSchema = z
  .object({
    plan: z.enum(["start", "pro", "premium"]),
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().min(10),
    document: z.string().trim().min(11).optional(),
    cpfCnpj: z.string().trim().min(11).optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas nao coincidem.",
        path: ["confirmPassword"]
      });
    }

    if (!value.document && !value.cpfCnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF ou CNPJ obrigatorio.",
        path: ["cpfCnpj"]
      });
    }
  })
  .transform((value) => ({
    plan: value.plan,
    name: value.name,
    email: value.email,
    phone: value.phone,
    document: value.document ?? value.cpfCnpj ?? "",
    password: value.password,
    confirmPassword: value.confirmPassword
  }));

export const asaasWebhookTokenSchema = z.string().trim().min(1);

const asaasWebhookPaymentSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    subscription: z.string().trim().min(1).optional(),
    externalReference: z.string().trim().min(1).nullable().optional(),
    status: z.string().trim().min(1).optional()
  })
  .passthrough();

const asaasWebhookSubscriptionSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    externalReference: z.string().trim().min(1).nullable().optional(),
    status: z.string().trim().min(1).optional(),
    deleted: z.boolean().optional()
  })
  .passthrough();

export const asaasWebhookEventSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    event: z.string().trim().min(1),
    payment: asaasWebhookPaymentSchema.optional(),
    subscription: asaasWebhookSubscriptionSchema.optional()
  })
  .passthrough()
  .superRefine((value, ctx) => {
    if (value.event.startsWith("PAYMENT_") && !value.payment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Webhook de pagamento sem payload payment.",
        path: ["payment"]
      });
    }

    if (value.event.startsWith("SUBSCRIPTION_") && !value.subscription) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Webhook de assinatura sem payload subscription.",
        path: ["subscription"]
      });
    }
  });
