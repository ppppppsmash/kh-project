"use server";

import { db } from "@/db";
import { tabs } from "@/db/schema";
import { tasks } from "@/db/schema/tasks";
import type { TabFormValues } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTab(name: string) {
	try {
		const tab = await db
			.insert(tabs)
			.values({
				name,
			})
			.returning();
		revalidatePath("/superadmin/task");
		return tab;
	} catch (error) {
		throw new Error("タブの作成に失敗しました");
	}
}

export async function updateTab(id: string, name: string) {
	try {
		const tab = await db
			.update(tabs)
			.set({
				name,
			})
			.where(eq(tabs.id, id))
			.returning();
		revalidatePath("/superadmin/task");
		return tab;
	} catch (error) {
		throw new Error("タブの更新に失敗しました");
	}
}

export async function deleteTab(
	id: string,
	options?: { moveTasksToTabId?: string; deleteTasks?: boolean },
) {
	try {
		// 関連するタスクの処理
		if (options?.moveTasksToTabId) {
			// タスクを別のタブに移動
			await db
				.update(tasks)
				.set({
					tabId: options.moveTasksToTabId,
				})
				.where(eq(tasks.tabId, id));
		} else if (options?.deleteTasks) {
			// タスクを削除
			await db.delete(tasks).where(eq(tasks.tabId, id));
		}

		// タブを削除
		const tab = await db.delete(tabs).where(eq(tabs.id, id)).returning();
		revalidatePath("/superadmin/task");
		return tab;
	} catch (error) {
		throw new Error("タブの削除に失敗しました");
	}
}

export const getTabs = async (): Promise<TabFormValues[]> => {
	try {
		const result = await db.select().from(tabs).orderBy(tabs.createdAt);
		return result.map((tab) => ({
			...tab,
			createdAt: tab.createdAt ?? new Date(),
			updatedAt: tab.updatedAt ?? new Date(),
		}));
	} catch (error) {
		console.error("Error fetching tabs:", error);
		return [];
	}
};
