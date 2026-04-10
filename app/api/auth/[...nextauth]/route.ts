import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { connectDB } from "@/lib/db";
import { upsertSocialAccount } from "@/lib/social_account";
import { createToken } from "@/helpers/authenHelper";
import { createUser, getUser } from "@/lib/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      if (!account) return false;

      // 1. get user
      let dbUser = await getUser(user.email!);

      // 2. create user nếu chưa có
      if (!dbUser) {
        dbUser = await createUser({
          email: user.email!,
          password: null,
          name: user.name || "",
          avatar: user.image || "",
        });
      }

      if (!dbUser) return false;

      const tokens = await createToken(
        {
          user_id: dbUser.user_id,
          email: dbUser.email,
          name: dbUser.name,
        }
   );

      // 4. upsert social account
      await upsertSocialAccount({
        user_id: dbUser.user_id,
        provider: account.provider,
        provider_id: account.providerAccountId,
        provider_email: user.email!,
        token: tokens?.accessToken,
        token_expires_at: new Date(Date.now() + 60 * 60 * 1000),
      });

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };