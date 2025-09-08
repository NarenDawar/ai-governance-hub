// src/lib/auth.ts

import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma"; // Note the corrected path to prisma
import { type Adapter } from "next-auth/adapters";

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};