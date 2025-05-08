import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser, getUserRole } from "@/actions/user";
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
      profile: async (profile: any) => {
        const role = await getUserRole(profile.email);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: role,
        };
      },
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
        profile?.email?.endsWith(GOOGLE_ADMIN_EMAIL_DOMAIN) &&
        (await getUserRole(profile.email)) === "admin"
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

      // userロールの場合はログインを拒否、許可を通るためにusersに登録しておく
      if (
        account?.provider === "google" &&
        profile?.email?.endsWith(GOOGLE_ADMIN_EMAIL_DOMAIN) &&
        (await getUserRole(profile.email)) === "user"
      ) {
        const user = await createUser({
          name: profile.name as string,
          email: profile.email as string,
          image: profile.picture as string,
        });

        return false;
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
      
          // db上のuserIdをtokenに格納
          token.id = user?.id as string;
        }
      }

      return token;
    },
    session: async ({ session, token, user }) => {
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
