import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser } from "@/actions/user";
import { createUserActivity } from "@/actions/user-activity";

type ClientType = {
  clientId: string;
  clientSecret: string;
};

const GOOGLE_ADMIN_EMAIL_DOMAIN = process.env.GOOGLE_ADMIN_EMAIL_DOMAIN as string;

export const { auth, handlers } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as ClientType)
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 6 * 60 * 60, // 6時間
  },
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (
        account?.provider === "google" &&
        profile?.email?.endsWith(GOOGLE_ADMIN_EMAIL_DOMAIN)
      ) {

        const user = await createUser({
          name: profile.name as string,
          email: profile.email as string,
          image: profile.picture as string,
        });

        // ログイン成功時に履歴を記録
        await createUserActivity({
          userId: user?.id as string,
          userName: profile.name as string,
          action: "login",
        });

        return true;
      }

      // それ以外は拒否
      return false;
    },
    jwt: async ({ token, user, account, profile }) => {
      if (user) {
        token.user = user;
        const u = user as any;
        token.role = u.role;
        token.id = u.id;
      }

      if (account) {
        token.accessToken = account.access_token;

        if (account?.provider === "google" && profile?.email) {
          const user = await createUser({
            name: profile.name as string,
            email: profile.email as string,
            image: profile.picture as string,
          });
      
          // db上のuser idをtokenに格納
          token.id = user?.id as string;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role,
        },
      };
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url === `${baseUrl}/api/auth/signout`) return `${baseUrl}/signin`;
      if (url === `${baseUrl}/api/auth/signin`) return `${baseUrl}/admin/dashboard`;

      return url;
    },
  },
});
