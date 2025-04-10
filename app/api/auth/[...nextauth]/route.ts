import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type ClientType = {
  clientId: string;
  clientSecret: string;
};

const { handlers } = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      } as ClientType)
    ],
    session: { strategy: "jwt" },
    callbacks: {
      signIn: async ({ account, profile }) => {
        if (account?.provider === "google") {
          return true;
        }
        return true;
      },
      jwt: async ({ token, user }) => {
        if (user) {
          token.user = user;
          const u = user as any;
          token.role = u.role;
        }

        return token;
      },
      session: async ({ session, token }) => {
        return {
          ...session,
          user: {
            ...session.user,
            role: token.role,
          },
        };
      },
      redirect: async ({ url, baseUrl }) => {
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (url === `${baseUrl}/api/auth/signout`) return `${baseUrl}/signin`;
        if (url === `${baseUrl}/api/auth/signin`) return `${baseUrl}/dashboard`;

        return url;
      },
    },
});

export const { GET, POST } = handlers;
