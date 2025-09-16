import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { type Adapter } from "next-auth/adapters";
import { Role } from "@prisma/client"; // Import the Role enum

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!token.email) {
        return token;
      }
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.organizationId = dbUser.organizationId;
        token.role = dbUser.role; // <-- ADD THIS LINE
      }
      
      return token;
    },
    async session({ session, token }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | null;
        session.user.role = token.role as Role; // <-- ADD THIS LINE
      }
      return session;
    },
  },
};