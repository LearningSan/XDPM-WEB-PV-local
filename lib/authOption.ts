import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { findSocial, createSocial } from "@/lib/social_account";
import { getUser, createUser, getUserById } from "@/lib/user";

export const authOptions = {
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
    async signIn({ user, account }: any) {
      const email = user.email!;
      const name = user.name || "";

      const provider = account?.provider!;
      const provider_id = account?.providerAccountId!;
     console.log("signIn callback:", { email, name, provider, provider_id });
      let social = await findSocial(provider, provider_id);

      let dbUser;

      if (social) {
        dbUser = await getUserById(social.user_id);
      } else {
        dbUser = await getUser(email);

        if (!dbUser) {
          dbUser = await createUser({
            email,
            password: null,
            name,
            avatar: user.image || "",
          });
        }
        if (!dbUser)         throw new Error("User creation failed");
        await createSocial(dbUser.user_id, provider, provider_id, email);
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};