import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();

        // Max 5 attempts per email per 10 minutes — blocks brute-force
        // password guessing without locking out normal users who just
        // mistype their password once or twice.
        const limit = checkRateLimit(`login:${email}`, 5, 10 * 60 * 1000);
        if (!limit.allowed) {
          throw new Error(
            `Too many login attempts. Please try again in ${Math.ceil(
              limit.retryAfterSeconds / 60
            )} minute(s).`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        if (user.suspended) {
          throw new Error("This account has been suspended. Contact support.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "CUSTOMER" | "AGENT" | "ADMIN" | "CALL_CENTER" }).role;
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};