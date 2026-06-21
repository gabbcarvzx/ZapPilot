const ADMIN_FALLBACK = "admin@local.test";

function read(value: string | undefined) {
  return value?.trim() ?? "";
}

function readBoolean(value: string | undefined) {
  return read(value).toLowerCase() === "true";
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
  asaasApiKey: read(process.env.ASAAS_API_KEY),
  asaasEnv: read(process.env.ASAAS_ENV) || "sandbox",
  asaasWebhookToken: read(process.env.ASAAS_WEBHOOK_TOKEN),
  asaasSuccessUrl: read(process.env.ASAAS_SUCCESS_URL),
  asaasCancelUrl: read(process.env.ASAAS_CANCEL_URL),
  mockModeEnabled: read(process.env.MOCK_MODE_ENABLED),
  systemValidateKey: read(process.env.SYSTEM_VALIDATE_KEY),
  adminEmailsRaw: read(process.env.ADMIN_EMAILS)
};

export const envFlags = {
  isProduction: process.env.NODE_ENV === "production",
  databaseConfigured: Boolean(env.databaseUrl),
  authConfigured: Boolean(env.authSecret),
  geminiLive: Boolean(env.geminiApiKey),
  whatsappLive:
    Boolean(env.whatsappAccessToken) &&
    Boolean(env.whatsappPhoneNumberId) &&
    Boolean(env.whatsappBusinessAccountId),
  billingConfigured: Boolean(env.asaasApiKey) && Boolean(env.asaasWebhookToken),
  adminEmailsConfigured: Boolean(env.adminEmailsRaw),
  mockModeEnabled: process.env.NODE_ENV === "test" ? true : readBoolean(process.env.MOCK_MODE_ENABLED)
};

export interface EnvironmentValidationItem {
  name: string;
  requiredInProduction: boolean;
  configured: boolean;
  category: "core" | "auth" | "database" | "billing" | "whatsapp" | "ai" | "security";
}

export function getEnvironmentValidationItems(): EnvironmentValidationItem[] {
  return [
    {
      name: "AUTH_SECRET",
      requiredInProduction: true,
      configured: envFlags.authConfigured,
      category: "auth"
    },
    {
      name: "DATABASE_URL",
      requiredInProduction: true,
      configured: envFlags.databaseConfigured,
      category: "database"
    },
    {
      name: "NEXTAUTH_URL",
      requiredInProduction: true,
      configured: Boolean(read(process.env.NEXTAUTH_URL)),
      category: "core"
    },
    {
      name: "SYSTEM_VALIDATE_KEY",
      requiredInProduction: true,
      configured: Boolean(env.systemValidateKey),
      category: "security"
    },
    {
      name: "ASAAS_API_KEY",
      requiredInProduction: false,
      configured: Boolean(env.asaasApiKey),
      category: "billing"
    },
    {
      name: "ASAAS_WEBHOOK_TOKEN",
      requiredInProduction: false,
      configured: Boolean(env.asaasWebhookToken),
      category: "billing"
    },
    {
      name: "GEMINI_API_KEY",
      requiredInProduction: false,
      configured: Boolean(env.geminiApiKey),
      category: "ai"
    },
    {
      name: "WHATSAPP_ACCESS_TOKEN",
      requiredInProduction: false,
      configured: Boolean(env.whatsappAccessToken),
      category: "whatsapp"
    },
    {
      name: "WHATSAPP_PHONE_NUMBER_ID",
      requiredInProduction: false,
      configured: Boolean(env.whatsappPhoneNumberId),
      category: "whatsapp"
    },
    {
      name: "WHATSAPP_BUSINESS_ACCOUNT_ID",
      requiredInProduction: false,
      configured: Boolean(env.whatsappBusinessAccountId),
      category: "whatsapp"
    }
  ];
}

export function getMissingRequiredProductionEnvs() {
  if (!envFlags.isProduction) {
    return [];
  }

  return getEnvironmentValidationItems()
    .filter((item) => item.requiredInProduction && !item.configured)
    .map((item) => item.name);
}

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
