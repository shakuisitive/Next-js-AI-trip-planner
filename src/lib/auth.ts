import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user exists and has status true
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      // If user doesn't exist yet, allow sign in (they will be created with default status=true)
      if (!dbUser) return true;

      // Only allow sign in if user status is true
      return dbUser.status === true;
    },

    async session({ session, user }) {
      // Add user ID to session
      session.user.id = user.id;
      return session;
    },
  },
});
