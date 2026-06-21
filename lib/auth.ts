import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env, getAdminEmails } from "@/lib/env";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { logInfo, logWarn } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { findUserByEmail, getBusinessSnapshot } from "@/server/services/business-service";
import { loginSchema } from "@/server/validators/auth";

const secret = resolveAuthSecret(env.authSecret);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: "jwt"
  },
  secret,
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const values = loginSchema.safeParse(credentials);
        if (!values.success) {
          logWarn("auth.login.rejected", {
            metadata: {
              reason: "invalid_payload"
            }
          });
          return null;
        }

        const user = await findUserByEmail(values.data.email);
        if (!user) {
          logWarn("auth.login.rejected", {
            metadata: {
              reason: "user_not_found"
            }
          });
          return null;
        }

        const valid = await compare(values.data.password, user.passwordHash);
        if (!valid) {
          logWarn("auth.login.rejected", {
            userId: user.id,
            businessId: ("businessId" in user && user.businessId) || ("business" in user && user.business?.id) || "",
            metadata: {
              reason: "invalid_password"
            }
          });
          return null;
        }

        const adminEmails = getAdminEmails();
        const businessId = ("businessId" in user && user.businessId) || ("business" in user && user.business?.id) || "";
        const resolvedRole = adminEmails.includes(user.email.toLowerCase()) ? "ADMIN" : user.role;

        logInfo("auth.login.succeeded", {
          userId: user.id,
          businessId,
          metadata: {
            role: resolvedRole
          }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolvedRole,
          businessId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.businessId = (user as { businessId?: string }).businessId ?? "";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "CUSTOMER";
        session.user.businessId = (token.businessId as string) ?? "";
      }
      return session;
    }
  }
});

export async function getCurrentBusiness() {
  const session = await auth();
  if (!session?.user?.businessId) return null;
  return getBusinessSnapshot(session.user.businessId);
}
