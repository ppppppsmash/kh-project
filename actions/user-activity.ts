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

// ユーザ操作履歴を記録する汎用ヘルパー関数
export const logActivity = async (
	userId: string,
	userName: string,
	action: UserActivityFormValues["action"],
	resourceType: UserActivityFormValues["resourceType"],
	resourceId?: string,
	resourceName?: string,
	details?: Record<string, unknown>
) => {
	try {
		await createUserActivity({
			userId,
			userName,
			action,
			resourceType,
			resourceId,
			resourceName,
			resourceDetails: details ? JSON.stringify(details) : undefined,
		});
	} catch (error) {
		console.error(`Error logging ${resourceType} activity:`, error);
		// ログ記録の失敗は本体操作を妨げないようにする
	}
};

// 後方互換のエイリアス
export const logTaskActivity = async (
	userId: string, userName: string,
	action: "task_create" | "task_update" | "task_delete",
	taskId?: string, taskTitle?: string, details?: Record<string, unknown>
) => logActivity(userId, userName, action, "task", taskId, taskTitle, details);

export const logQaActivity = async (
	userId: string, userName: string,
	action: "qa_create" | "qa_update" | "qa_delete",
	qaId?: string, qaQuestion?: string, details?: Record<string, unknown>
) => logActivity(userId, userName, action, "qa", qaId, qaQuestion, details);

export const logAuthActivity = async (
	userId: string, userName: string,
	action: "login" | "logout"
) => logActivity(userId, userName, action, action);
