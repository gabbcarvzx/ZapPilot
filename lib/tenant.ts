import { requireUser } from "@/lib/guards";

export async function resolveTenantBusinessId() {
  const user = await requireUser();
  return user.businessId;
}
