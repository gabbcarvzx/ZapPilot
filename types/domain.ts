export type UserRole = "CUSTOMER" | "ADMIN";
export type SubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus =
  | "CHECKOUT_PENDING"
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "CANCELED";
export type ConversationStatus = "OPEN" | "NEEDS_HUMAN" | "CLOSED";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageSource = "USER" | "BOT" | "HUMAN" | "SYSTEM";
export type LeadStatus = "NEW" | "QUALIFIED" | "NEEDS_HUMAN" | "CONVERTED";

export type PlanCode = "START" | "PRO" | "PREMIUM";

export interface PlanRecord {
  id: string;
  code: PlanCode;
  name: string;
  priceCents: number;
  currency: string;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRecord {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  niche: string;
  document: string | null;
  address: string;
  phone: string;
  whatsappNumber: string;
  businessHours: string;
  welcomeMessage: string;
  closedMessage: string;
  tone: string;
  isOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  businessId: string;
  planId: string;
  status: SubscriptionStatus;
  asaasCustomerId: string | null;
  asaasSubscriptionId: string | null;
  asaasPaymentId: string | null;
  checkoutUrl: string | null;
  paymentStatus: PaymentStatus | null;
  paidAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  activatedAt: string | null;
  canceledAt: string | null;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConfigRecord {
  id: string;
  businessId: string;
  metaBusinessAccountId: string;
  metaPhoneNumberId: string;
  metaAppId: string;
  verifyToken: string;
  accessToken: string;
  webhookStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRecord {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqRecord {
  id: string;
  businessId: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationRecord {
  id: string;
  businessId: string;
  contactPhone: string;
  contactName: string;
  status: ConversationStatus;
  lastMessageAt: string;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  businessId: string;
  conversationId: string;
  direction: MessageDirection;
  source: MessageSource;
  content: string;
  metaJson: string;
  sentAt: string;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  businessId: string;
  conversationId: string | null;
  name: string;
  phone: string;
  notes: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}
