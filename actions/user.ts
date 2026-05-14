"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { uploadToBlob } from "@/lib/blob";
import type { MemberFormValues } from "@/lib/validations";
import { eq } from "drizzle-orm";

type Account = {
	id: string;
	name: string;
	image: string;
	email: string;
	role?: MemberFormValues["role"];
	isActive?: boolean | null;
	createdAt?: Date;
	updatedAt?: Date;
};

type CreateUserInput = {
	name: string;
	email: string;
	image: string;
	role?: MemberFormValues["role"];
};

export interface PhotoInUser extends MemberFormValues {
	photo: File;
}

export const getUser = async (email: string) => {
	const user = await db.select().from(users).where(eq(users.email, email));
	return user[0];
};

export const getUserInfo = async (): Promise<MemberFormValues | undefined> => {
	const session = await auth();

	if (!session?.user?.email) {
		return undefined;
	}

	const user = await db
		.select()
		.from(users)
		.where(eq(users.email, session.user.email));

	if (!user[0]) {
		return undefined;
	}

	return {
		...user[0],
		role: user[0].role as MemberFormValues["role"],
		department: user[0].department as string,
		position: user[0].position as string,
		hobby: user[0].hobby as string,
		skills: user[0].skills as string[],
		skills_message: user[0].skills_message as string,
		freeText: user[0].freeText as string,
		photoUrl: user[0].photoUrl as string,
		isActive: user[0].isActive as boolean,
		// joinDate: user[0].joinDate as Date,
		// leaveDate: user[0].leaveDate as Date,
		// createdAt: user[0].createdAt as Date,
		// updatedAt: user[0].updatedAt as Date,
	};
};

export const existsUser = async (email: string) => {
	const user = await db.select().from(users).where(eq(users.email, email));
	return user.length > 0;
};

export const createUser = async (
	data: CreateUserInput,
): Promise<Account | undefined> => {
	try {
		// 既存のユーザーを確認
		const existingUser = await getUser(data.email);
		if (existingUser) {
			// 既存ユーザーの場合、updatedAtを更新
			const [updatedUser] = await db
				.update(users)
				.set({
					name: data.name,
					image: data.image,
					updatedAt: new Date(),
				})
				.where(eq(users.email, data.email))
				.returning();

			return {
				...updatedUser,
				role: updatedUser.role as MemberFormValues["role"],
			};
		}

		// 新規ユーザーの場合のみ作成
		const [user] = await db
			.insert(users)
			.values({
				...data,
				role: data.role,
			})
			.returning();

		return {
			...user,
			role: user.role as MemberFormValues["role"],
		};
	} catch (error) {
		console.error("Error creating user:", error);
	}
};

export const getUserRole = async (
	email: string,
): Promise<MemberFormValues["role"]> => {
	try {
		const user = await db
			.select({
				role: users.role,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		return user[0].role as MemberFormValues["role"];
	} catch (error) {
		console.error("Error getting user role:", error);
		return "superadmin";
	}
};

export const getUserList = async (): Promise<MemberFormValues[]> => {
	const usersData = await db.select().from(users);
	return usersData.map((user) => ({
		...user,
		role: user.role as MemberFormValues["role"],
		department: user.department as string,
		position: user.position as string,
		hobby: user.hobby as string,
		skills: user.skills as string[],
		skills_message: user.skills_message as string,
		freeText: user.freeText as string,
		photoUrl: user.photoUrl as string,
		isActive: user.isActive as boolean,
		createdAt: user.createdAt as Date,
		updatedAt: user.updatedAt as Date,
	}));
};

export const getUserStatus = async (id: string) => {
	const [row] = await db
		.select({ isActive: users.isActive, role: users.role })
		.from(users)
		.where(eq(users.id, id))
		.limit(1);
	if (!row) return null;
	return {
		isActive: row.isActive ?? false,
		role: row.role as MemberFormValues["role"],
	};
};

// 自分自身の承認ステータス確認用（/pending ページからポーリング）
export const checkMyApproval = async () => {
	const session = await auth();
	if (!session?.user?.id) return null;
	return await getUserStatus(session.user.id);
};

export const getActiveUsers = async (): Promise<MemberFormValues[]> => {
	const usersData = await db
		.select()
		.from(users)
		.where(eq(users.isActive, true));
	return usersData.map((user) => ({
		...user,
		role: user.role as MemberFormValues["role"],
		department: user.department as string,
		position: user.position as string,
		hobby: user.hobby as string,
		skills: user.skills as string[],
		skills_message: user.skills_message as string,
		freeText: user.freeText as string,
		photoUrl: user.photoUrl as string,
		isActive: user.isActive as boolean,
		createdAt: user.createdAt as Date,
		updatedAt: user.updatedAt as Date,
	}));
};

export const getPendingUsers = async (): Promise<MemberFormValues[]> => {
	const usersData = await db
		.select()
		.from(users)
		.where(eq(users.isActive, false));
	return usersData.map((user) => ({
		...user,
		role: user.role as MemberFormValues["role"],
		department: user.department as string,
		position: user.position as string,
		hobby: user.hobby as string,
		skills: user.skills as string[],
		skills_message: user.skills_message as string,
		freeText: user.freeText as string,
		photoUrl: user.photoUrl as string,
		isActive: user.isActive as boolean,
		createdAt: user.createdAt as Date,
		updatedAt: user.updatedAt as Date,
	}));
};

export const rejectUser = async (id: string) => {
	const session = await auth();
	const approver = session?.user;
	const { userActivity } = await import("@/db/schema");

	// FK 制約のため、活動ログを先に削除
	await db.delete(userActivity).where(eq(userActivity.userId, id));

	const [deleted] = await db
		.delete(users)
		.where(eq(users.id, id))
		.returning();

	if (deleted && approver?.id) {
		const { createUserActivity } = await import("./user-activity");
		await createUserActivity({
			userId: approver.id,
			userName: approver.name ?? "",
			action: "member_delete",
			resourceType: "member",
			resourceId: deleted.id,
			resourceName: deleted.name,
			resourceDetails: JSON.stringify({ rejected: true }),
		});
	}

	return deleted;
};

export const approveUser = async (
	id: string,
	role: MemberFormValues["role"],
) => {
	const session = await auth();
	const approver = session?.user;

	const [updated] = await db
		.update(users)
		.set({
			isActive: true,
			role,
			updatedAt: new Date(),
		})
		.where(eq(users.id, id))
		.returning();

	if (updated && approver?.id) {
		const { createUserActivity } = await import("./user-activity");
		await createUserActivity({
			userId: approver.id,
			userName: approver.name ?? "",
			action: "member_update",
			resourceType: "member",
			resourceId: updated.id,
			resourceName: updated.name,
			resourceDetails: JSON.stringify({
				approved: true,
				role,
			}),
		});
	}

	return updated;
};

export const updateUserInfo = async (
	id: string,
	data: MemberFormValues & { photoFile?: File },
) => {
	try {
		let photoUrl = data.photoUrl;

		// 新しい画像がアップロードされた場合
		if (data.photoFile) {
			photoUrl = await uploadToBlob(data.photoFile);
		}

		const [updatedUser] = await db
			.update(users)
			.set({
				...data,
				photoUrl,
				updatedAt: new Date(),
			})
			.where(eq(users.id, id))
			.returning();

		return updatedUser;
	} catch (error) {
		console.error("ユーザー情報の更新に失敗しました:", error);
		throw error;
	}
};
