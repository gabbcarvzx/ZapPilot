import { auth } from "@/lib/auth";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
