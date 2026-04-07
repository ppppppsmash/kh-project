"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq, gte } from "drizzle-orm";
import { getCurrentUser } from "./auth-helper";

// heartbeat: 自分の lastSeenAt を更新
export const heartbeat = async () => {
	const { userId } = await getCurrentUser();
	if (userId === "unknown") return;

	await db
		.update(users)
		.set({ lastSeenAt: new Date() })
		.where(eq(users.id, userId));
};

// 直近2分以内にアクティブなユーザーを取得
export const getOnlineUsers = async () => {
	const threshold = new Date(Date.now() - 2 * 60 * 1000);

	const onlineUsers = await db
		.select({
			id: users.id,
			name: users.name,
			image: users.image,
			email: users.email,
			lastSeenAt: users.lastSeenAt,
		})
		.from(users)
		.where(gte(users.lastSeenAt, threshold));

	return onlineUsers;
};
