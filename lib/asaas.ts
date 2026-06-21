import { PlanRecord } from "@/types/domain";

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

export interface AsaasCustomerInput {
  name: string;
  email: string;
  mobilePhone: string;
  cpfCnpj: string;
  externalReference: string;
  existingCustomerId?: string;
}

export interface AsaasCustomerResponse {
  id: string;
}

export interface AsaasSubscriptionCheckoutInput {
  customerId: string;
  plan: PlanRecord;
  externalReference: string;
  email: string;
}

export interface AsaasSubscriptionCheckoutResponse {
  id: string;
  paymentId: string | null;
  invoiceUrl: string;
  status: string;
}

interface AsaasSubscriptionResponse {
  id: string;
}

interface AsaasSubscriptionPayment {
  id: string;
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  paymentLink?: string;
  checkoutUrl?: string;
}

interface AsaasSubscriptionPaymentsResponse {
  data?: AsaasSubscriptionPayment[];
}

function getHeaders() {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    throw new Error("ASAAS_API_KEY ausente.");
  }

  return {
    accept: "application/json",
    "content-type": "application/json",
    access_token: apiKey
  };
}

function resolveSuccessUrl() {
  const explicitSuccessUrl = process.env.ASAAS_SUCCESS_URL?.trim();
  const baseAppUrl = process.env.NEXTAUTH_URL?.trim();
  const isProduction = process.env.ASAAS_ENV === "production";

  if (explicitSuccessUrl) {
    const hasStatusParam = /[?&]status=/i.test(explicitSuccessUrl);
    if (hasStatusParam) {
      return explicitSuccessUrl;
    }

    return `${explicitSuccessUrl}${explicitSuccessUrl.includes("?") ? "&" : "?"}status=pending`;
  }

  if (baseAppUrl) {
    return `${baseAppUrl.replace(/\/+$/, "")}/success?status=pending`;
  }

  if (isProduction) {
    throw new Error("Configure NEXTAUTH_URL ou ASAAS_SUCCESS_URL para producao.");
  }

  return "http://localhost:3000/success?status=pending";
}

export async function asaasRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ASAAS request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function createOrUpdateAsaasCustomer(
  input: AsaasCustomerInput
): Promise<AsaasCustomerResponse> {
  const payload = {
    name: input.name,
    email: input.email,
    mobilePhone: input.mobilePhone,
    cpfCnpj: input.cpfCnpj,
    externalReference: input.externalReference
  };

  if (input.existingCustomerId) {
    return asaasRequest<AsaasCustomerResponse>(`/customers/${input.existingCustomerId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  return asaasRequest<AsaasCustomerResponse>("/customers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createAsaasSubscriptionCheckout(
  input: AsaasSubscriptionCheckoutInput
): Promise<AsaasSubscriptionCheckoutResponse> {
  const successUrl = resolveSuccessUrl();

  const subscription = await asaasRequest<AsaasSubscriptionResponse>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED",
      cycle: "MONTHLY",
      value: input.plan.priceCents / 100,
      nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: `ZapPilot ${input.plan.name}`,
      externalReference: input.externalReference,
      callback: {
        successUrl,
        autoRedirect: true
      }
    })
  });

  const payments = await asaasRequest<AsaasSubscriptionPaymentsResponse>(
    `/subscriptions/${subscription.id}/payments`
  );
  const firstPayment = payments.data?.[0];

  if (!firstPayment) {
    throw new Error("ASAAS subscription payment was not generated.");
  }

  const invoiceUrl =
    firstPayment.invoiceUrl ??
    firstPayment.checkoutUrl ??
    firstPayment.bankSlipUrl ??
    firstPayment.transactionReceiptUrl ??
    firstPayment.paymentLink;

  if (!invoiceUrl) {
    throw new Error("ASAAS subscription payment did not return a payment URL.");
  }

  const normalizedStatus =
    firstPayment.status === "PENDING" ||
    firstPayment.status === "RECEIVED" ||
    firstPayment.status === "CONFIRMED" ||
    firstPayment.status === "OVERDUE" ||
    firstPayment.status === "REFUNDED" ||
    firstPayment.status === "CANCELED"
      ? firstPayment.status
      : "PENDING";

  return {
    id: subscription.id,
    paymentId: firstPayment.id,
    invoiceUrl,
    status: normalizedStatus
  };
}
