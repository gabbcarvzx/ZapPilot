import { GoogleGenerativeAI } from "@google/generative-ai";

import { envFlags, env } from "@/lib/env";

interface GeminiInput {
  businessName: string;
  niche: string;
  businessHours: string;
  products: Array<{ name: string; description: string; price: string }>;
  faqs: Array<{ question: string; answer: string }>;
  tone: string;
  welcomeMessage: string;
  closedMessage: string;
  latestCustomerMessage: string;
}

export async function generateBusinessReply(input: GeminiInput) {
  if (!envFlags.geminiLive) {
    return buildMockReply(input);
  }

  const gemini = new GoogleGenerativeAI(env.geminiApiKey);
  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Você é um atendente comercial do negócio ${input.businessName}, nicho ${input.niche}.
Tom obrigatório: ${input.tone}.
Horário: ${input.businessHours || "não informado"}.
Mensagem inicial: ${input.welcomeMessage}.
Mensagem fora do horário: ${input.closedMessage}.
Produtos/serviços: ${input.products.map((item) => `${item.name} - ${item.description} - ${item.price}`).join("; ")}.
FAQ: ${input.faqs.map((item) => `${item.question}: ${item.answer}`).join("; ")}.

Responda de forma curta, natural, objetiva e comercial.
Se não souber algo com segurança, responda que vai encaminhar para atendimento humano.

Mensagem do cliente: ${input.latestCustomerMessage}
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function buildMockReply(input: GeminiInput) {
  const message = input.latestCustomerMessage.toLowerCase();
  if (message.includes("preço") || message.includes("valor")) {
    const product = input.products[0];
    if (product) {
      return `${product.name} sai por ${product.price}. Se quiser, já posso te explicar como funciona o pedido.`;
    }
  }

  if (message.includes("horário")) {
    return `Nosso horário é ${input.businessHours || "conforme combinado no painel"}. Se quiser, já deixo seu contato registrado.`;
  }

  if (message.includes("endereço")) {
    return "Posso te passar o endereço certinho no atendimento humano. Já vou encaminhar sua solicitação.";
  }

  return "Entendi. Vou encaminhar sua solicitação para um atendente humano te responder com precisão.";
}
