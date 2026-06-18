import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";
import { isSubscriptionActive } from "@/server/services/subscription-service";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function requireActiveSubscription() {
  const user = await requireUser();
  const active = await isSubscriptionActive(user.businessId);
  if (!active) redirect("/blocked");
  return user;
}
