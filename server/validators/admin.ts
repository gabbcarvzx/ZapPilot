import { z } from "zod";

export const subscriptionUpdateSchema = z.object({
  businessId: z.string().min(1),
  planId: z.string().min(1),
  status: z.enum(["PENDING", "ACTIVE", "CANCELED", "EXPIRED"])
});
