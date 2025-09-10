import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
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
    // CORRECTED: This callback now ensures the token is always up-to-date
    async jwt({ token }: any) {
      if (!token.email) {
        return token;
      }
      // Fetch the most recent user data from the database
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
      });

      // If user exists, update the token with the latest info
      if (dbUser) {
        token.id = dbUser.id;
        token.organizationId = dbUser.organizationId;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
};