// "use server";

// import { db } from "@/db";
// import { tags } from "@/db/schema";
// import { tasks } from "@/db/schema/tasks";
// import type { TagFormValues } from "@/lib/validations";
// import { eq } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

// export async function createTag(name: string) {
// 	try {
// 		const tag = await db
// 			.insert(tags)
// 			.values({
// 				name,
// 			})
// 			.returning();
// 		revalidatePath("/superadmin/task");
// 		return tag;
// 	} catch (error) {
// 		throw new Error("タグの作成に失敗しました");
// 	}
// }

// export async function updateTag(id: string, name: string) {
// 	try {
// 		const tag = await db
// 			.update(tags)
// 			.set({
// 				name,
// 			})
// 			.where(eq(tags.id, id))
// 			.returning();
// 		revalidatePath("/superadmin/task");
// 		return tag;
// 	} catch (error) {
// 		throw new Error("タグの更新に失敗しました");
// 	}
// }

// export async function deleteTag(
// 	id: string,
// 	options?: { moveTasksToTagId?: string; deleteTasks?: boolean },
// ) {
// 	try {
// 		// 関連するタスクの処理
// 		if (options?.moveTasksToTagId) {
// 			// タスクを別のタブに移動
// 			await db
// 				.update(tasks)
// 				.set({
// 					tagId: options.moveTasksToTagId,
// 				})
// 				.where(eq(tasks.tagId, id));
// 		} else if (options?.deleteTasks) {
// 			// タスクを削除
// 			await db.delete(tasks).where(eq(tasks.tagId, id));
// 		}

// 		// タグを削除
// 		const tag = await db.delete(tags).where(eq(tags.id, id)).returning();
// 		revalidatePath("/superadmin/task");
// 		return tag;
// 	} catch (error) {
// 		throw new Error("タグの削除に失敗しました");
// 	}
// }

// export const getTags = async (): Promise<TagFormValues[]> => {
// 	try {
// 		const result = await db.select().from(tags).orderBy(tags.createdAt);
// 		return result.map((tag) => ({
// 			...tag,
// 			createdAt: tag.createdAt ?? new Date(),
// 			updatedAt: tag.updatedAt ?? new Date(),
// 		}));
// 	} catch (error) {
// 		console.error("Error fetching tags:", error);
// 		return [];
// 	}
// };
