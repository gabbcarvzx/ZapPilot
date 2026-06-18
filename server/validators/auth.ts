import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
  businessName: z.string().min(2, "Informe o nome do negócio"),
  niche: z.string().min(2, "Informe o nicho do negócio")
});

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres")
});
