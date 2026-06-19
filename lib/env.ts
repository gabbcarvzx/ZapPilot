const ADMIN_FALLBACK = "admin@local.test";

function read(value: string | undefined) {
  return value?.trim() ?? "";
}

export const env = {
  databaseUrl: read(process.env.DATABASE_URL),
  authSecret: read(process.env.AUTH_SECRET),
  nextAuthUrl: read(process.env.NEXTAUTH_URL) || "http://localhost:3000",
  geminiApiKey: read(process.env.GEMINI_API_KEY),
  whatsappAccessToken: read(process.env.WHATSAPP_ACCESS_TOKEN),
  whatsappPhoneNumberId: read(process.env.WHATSAPP_PHONE_NUMBER_ID),
  whatsappBusinessAccountId: read(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
  whatsappWebhookVerifyToken: read(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  adminEmailsRaw: read(process.env.ADMIN_EMAILS)
};

export const envFlags = {
  databaseConfigured: Boolean(env.databaseUrl),
  authConfigured: Boolean(env.authSecret),
  geminiLive: Boolean(env.geminiApiKey),
  whatsappLive:
    Boolean(env.whatsappAccessToken) &&
    Boolean(env.whatsappPhoneNumberId) &&
    Boolean(env.whatsappBusinessAccountId),
  adminEmailsConfigured: Boolean(env.adminEmailsRaw)
};

export function getAdminEmails() {
  const emails = env.adminEmailsRaw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length > 0) {
    return emails;
  }

  if (process.env.NODE_ENV !== "production") {
    return [ADMIN_FALLBACK];
  }

  return [];
}

export function getIntegrationMode(live: boolean) {
  return live ? "Ativo" : "Simulado";
}
