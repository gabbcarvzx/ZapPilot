const INSECURE_DEV_SECRET = "dev-only-insecure-secret";
const BUILD_TIME_PLACEHOLDER_SECRET = "build-time-placeholder-auth-secret-not-for-runtime";

function isProductionBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function resolveAuthSecret(secret: string) {
  const normalizedSecret = secret.trim();

  if (process.env.NODE_ENV === "production") {
    if (!normalizedSecret || normalizedSecret === INSECURE_DEV_SECRET) {
      if (isProductionBuildPhase()) {
        return BUILD_TIME_PLACEHOLDER_SECRET;
      }

      throw new Error("AUTH_SECRET seguro e obrigatorio em producao.");
    }

    return normalizedSecret;
  }

  return normalizedSecret || INSECURE_DEV_SECRET;
}
