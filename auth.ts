import { createUser, getUserRole } from "@/actions/user";
import { createUserActivity } from "@/actions/user-activity";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type ClientType = {
	clientId: string;
	clientSecret: string;
};

type Profile = {
	id: string;
	name: string;
	email: string;
	picture: string;
	role: string;
};

const GOOGLE_ADMIN_EMAIL_DOMAIN = process.env
	.GOOGLE_ADMIN_EMAIL_DOMAIN as string;

export const { auth, handlers } = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			profile: async (profile: Profile) => {
				const role = await getUserRole(profile.email);
				return {
					id: profile.id,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					role: role,
				};
			},
		} as ClientType),
	],
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 4 * 60 * 60, // 4時間
	},
	callbacks: {
		signIn: async ({ account, profile, user }) => {
			const email = profile?.email;
			const role = await getUserRole(email as string);

			const isGoogle = account?.provider === "google";
			const isSuperAdmin = role === "superadmin";
			const isAdmin = role === "admin";

			if (isGoogle && email?.endsWith(GOOGLE_ADMIN_EMAIL_DOMAIN)) {
				const user = await createUser({
					name: profile?.name as string,
					email: profile?.email as string,
					image: profile?.picture as string,
				});

				await createUserActivity({
					userId: user?.id || "",
					userName: profile?.name || "",
					action: "login",
				});

				return true;
			}

			return false;
		},
		jwt: async ({ token, user, account, profile }) => {
			if (user) {
				token.id = user.id as string;
				token.role = (user as Profile).role as string;
			}

			if (account) {
				token.accessToken = account.access_token;

				if (account?.provider === "google" && profile?.email) {
					const role = await getUserRole(profile.email as string);
					const user = await createUser({
						name: profile.name as string,
						email: profile.email as string,
						image: profile.picture as string,
						role: role,
					});

					token.id = user?.id as string;
					token.role = role as string;
				}
			}

			return token;
		},
		session: async ({ session, token }) => {
			if (token) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
			}

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
			if (url === `${baseUrl}/api/auth/signin`) {
				return `${baseUrl}/signin`;
			}
			return url;
		},
	},
});
