import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../../../../lib/prisma";
import { Adapter } from "next-auth/adapters";

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
  // --- THIS IS THE KEY CHANGE ---
  // Implement the callbacks to manage the JWT payload
  callbacks: {
    // 1. The jwt callback is called when a JWT is created or updated.
    async jwt({ token, user }: { token: any; user: any }) {
      // On initial sign in, the `user` object is available.
      // Persist the user's ID from the database into the token.
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // 2. The session callback is called when a session is checked.
    async session({ session, token }: { session: any; token: any }) {
      // The token has the user's ID we stored in the jwt callback.
      // Add this ID to the session object so it's available on the client.
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };