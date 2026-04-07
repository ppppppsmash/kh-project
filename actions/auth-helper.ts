"use server";

import { auth } from "@/auth";

export const getCurrentUser = async () => {
	try {
		const session = await auth();
		if (!session?.user?.id || !session?.user?.name) {
			throw new Error("User session not found");
		}
		return {
			userId: session.user.id,
			userName: session.user.name,
		};
	} catch (error) {
		console.error("Error getting current user:", error);
		return { userId: "unknown", userName: "不明なユーザー" };
	}
};
