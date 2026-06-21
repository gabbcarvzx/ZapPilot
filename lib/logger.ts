type LogLevel = "info" | "warn" | "error";

interface LogContext {
  businessId?: string | null;
  userId?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  businessId?: string | null;
  userId?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
}

const SENSITIVE_FIELD_PATTERN =
  /token|secret|authorization|password|cookie|api[-_]?key|cpf|cnpj|document|card|cvv|holder|payload/i;

function normalizeHeaderValue(value: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getRequestId(request: Request) {
  return (
    normalizeHeaderValue(request.headers.get("x-request-id")) ??
    normalizeHeaderValue(request.headers.get("x-correlation-id")) ??
    normalizeHeaderValue(request.headers.get("x-vercel-id")) ??
    crypto.randomUUID()
  );
}

export function withRequestId(requestId: string | null | undefined, context: LogContext = {}): LogContext {
  return {
    ...context,
    requestId: requestId ?? context.requestId ?? undefined
  };
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => {
        if (SENSITIVE_FIELD_PATTERN.test(key)) {
          return [key, "[REDACTED]"];
        }

        return [key, sanitizeValue(nestedValue)];
      })
    );
  }

  return value;
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const payload: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    businessId: context.businessId ?? undefined,
    userId: context.userId ?? undefined,
    requestId: context.requestId ?? undefined,
    metadata: context.metadata ? (sanitizeValue(context.metadata) as Record<string, unknown>) : undefined
  };

  const message = JSON.stringify(payload);

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.info(message);
}

export function logInfo(event: string, context?: LogContext) {
  writeLog("info", event, context);
}

export function logWarn(event: string, context?: LogContext) {
  writeLog("warn", event, context);
}

export function logError(event: string, context?: LogContext) {
  writeLog("error", event, context);
}
