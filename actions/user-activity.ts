"use server";

import { db } from "@/db";
import { userActivity } from "@/db/schema/user_activity";
import type { UserActivityFormValues } from "@/lib/validations";
import { desc } from "drizzle-orm";
import { cache } from "react";

type CreateUserActivityInput = {
	userId: string;
	userName: string;
	action: UserActivityFormValues["action"];
	resourceType?: UserActivityFormValues["resourceType"];
	resourceId?: string;
	resourceName?: string;
	resourceDetails?: string;
};

// キャッシュを使用してデータ取得を最適化
export const getUserActivity = cache(
	async (): Promise<UserActivityFormValues[]> => {
		try {
			// 必要なカラムのみを選択
			const activities = await db
				.select({
					id: userActivity.id,
					userId: userActivity.userId,
					userName: userActivity.userName,
					action: userActivity.action,
					resourceType: userActivity.resourceType,
					resourceId: userActivity.resourceId,
					resourceName: userActivity.resourceName,
					resourceDetails: userActivity.resourceDetails,
					createdAt: userActivity.createdAt,
				})
				.from(userActivity)
				.orderBy(desc(userActivity.createdAt))
				.limit(20); // 10件から20件に増加

			return activities.map((activity) => ({
				...activity,
				action: activity.action as UserActivityFormValues["action"],
				resourceType: activity.resourceType as UserActivityFormValues["resourceType"],
				resourceId: activity.resourceId ?? undefined,
				resourceName: activity.resourceName ?? undefined,
				resourceDetails: activity.resourceDetails ?? undefined,
				createdAt: activity.createdAt ?? new Date(),
			}));
		} catch (error) {
			console.error("Error fetching user activity:", error);
			throw error;
		}
	},
);

export const createUserActivity = async (data: CreateUserActivityInput) => {
	const newActivity = await db
		.insert(userActivity)
		.values({
			userId: data.userId,
			userName: data.userName,
			action: data.action,
			resourceType: data.resourceType,
			resourceId: data.resourceId,
			resourceName: data.resourceName,
			resourceDetails: data.resourceDetails,
		})
		.returning();

	return newActivity;
};

// タスク操作のユーザ操作履歴を記録するヘルパー関数
export const logTaskActivity = async (
	userId: string,
	userName: string,
	action: "task_create" | "task_update" | "task_delete",
	taskId?: string,
	taskTitle?: string,
	details?: Record<string, unknown>
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType: "task",
			resourceId: taskId,
			resourceName: taskTitle,
			resourceDetails: details ? JSON.stringify(details) : undefined,
		});
	} catch (error) {
		console.error("Error logging task activity:", error);
		// ログ記録の失敗はタスク操作を妨げないようにする
	}
};

// QA操作のユーザ操作履歴を記録するヘルパー関数
export const logQaActivity = async (
	userId: string,
	userName: string,
	action: "qa_create" | "qa_update" | "qa_delete",
	qaId?: string,
	qaQuestion?: string,
	details?: Record<string, unknown>
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType: "qa",
			resourceId: qaId,
			resourceName: qaQuestion,
			resourceDetails: details ? JSON.stringify(details) : undefined,
		});
	} catch (error) {
		console.error("Error logging QA activity:", error);
		// ログ記録の失敗はQA操作を妨げないようにする
	}
};

// メンバー操作のユーザ操作履歴を記録するヘルパー関数
export const logMemberActivity = async (
	userId: string,
	userName: string,
	action: "member_create" | "member_update" | "member_delete",
	memberId?: string,
	memberName?: string,
	details?: Record<string, unknown>
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType: "member",
			resourceId: memberId,
			resourceName: memberName,
			resourceDetails: details ? JSON.stringify(details) : undefined,
		});
	} catch (error) {
		console.error("Error logging member activity:", error);
		// ログ記録の失敗はメンバー操作を妨げないようにする
	}
};

// 部活動操作のユーザ操作履歴を記録するヘルパー関数
export const logClubActivity = async (
	userId: string,
	userName: string,
	action: "club_create" | "club_update" | "club_delete",
	clubId?: string,
	clubName?: string,
	details?: Record<string, unknown>
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType: "club",
			resourceId: clubId,
			resourceName: clubName,
			resourceDetails: details ? JSON.stringify(details) : undefined,
		});
	} catch (error) {
		console.error("Error logging club activity:", error);
		// ログ記録の失敗は部活動操作を妨げないようにする
	}
};

// ログイン・ログアウトのユーザ操作履歴を記録するヘルパー関数
export const logAuthActivity = async (
	userId: string,
	userName: string,
	action: "login" | "logout"
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType: action,
		});
	} catch (error) {
		console.error("Error logging auth activity:", error);
		// ログ記録の失敗は認証操作を妨げないようにする
	}
};
