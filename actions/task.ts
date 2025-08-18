"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import type { TaskFormValues } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { sendSlackMessage } from "@/lib/slackMessage";
import { logTaskActivity } from "./user-activity";
import { auth } from "@/auth";

// 現在のユーザ情報を取得する関数
const getCurrentUser = async () => {
	try {
		const session = await auth();
		if (!session?.user?.id || !session?.user?.name) {
			throw new Error("User session not found");
		}
		return { 
			userId: session.user.id, 
			userName: session.user.name 
		};
	} catch (error) {
		console.error("Error getting current user:", error);
		// デフォルト値を返す（実際の運用では適切なエラーハンドリングが必要）
		return { userId: "unknown", userName: "不明なユーザー" };
	}
};

export const getTasks = async (): Promise<TaskFormValues[]> => {
	const result = await db.select().from(tasks).orderBy(desc(tasks.taskId));

		return result.map((task) => ({
			...task,
			progress: task.progress as TaskFormValues["progress"],
			priority: task.priority as TaskFormValues["priority"],
			progressDetails: task.progressDetails || undefined,
			notes: task.notes || undefined,
			tabId: task.tabId || undefined,
			categoryId: task.categoryId || undefined,
			startedAt: task.startedAt || new Date(),
			completedAt: task.completedAt || null,
			createdAt: task.createdAt || new Date(),
			updatedAt: task.updatedAt || new Date(),
		}));
};

export const createTask = async (data: TaskFormValues) => {
	const lastTaskRecord = await db
		.select({ taskId: tasks.taskId })
		.from(tasks)
		.orderBy(desc(tasks.taskId))
		.limit(1);

	let taskId = "T001";
	if (lastTaskRecord.length > 0 && lastTaskRecord[0].taskId) {
		const match = lastTaskRecord[0].taskId.match(/T(\d+)/);
		if (match) {
			const nextNumber = Number.parseInt(match[1], 10) + 1;
			taskId = `T${nextNumber.toString().padStart(3, "0")}`;
		}
	}

	const taskData = {
		...data,
		taskId,
		link: data.link ?? "",
		notes: data.notes ?? "",
		startedAt: data.startedAt ?? new Date(),
		categoryId: data.categoryId || undefined,
		priority: data.priority || "none",
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	const newTask = await db.insert(tasks).values(taskData).returning();

	// Slack通知
	await sendSlackMessage({ message: `${taskData.title}` });

	// ユーザ操作履歴を記録
	try {
		const currentUser = await getCurrentUser();
		await logTaskActivity(currentUser.userId, currentUser.userName, "task_create", data.title);
	} catch (error) {
		console.error("Error logging task creation:", error);
	}

	return newTask;
};

export const updateTask = async (id: string, data: TaskFormValues) => {
	const updatedTask = await db
		.update(tasks)
		.set({
			...data,
			// memo: updatedAtを明示的に更新
			updatedAt: new Date(),
		})
		.where(eq(tasks.id, id))
		.returning();

	// ユーザ操作履歴を記録
	try {
		const currentUser = await getCurrentUser();
		await logTaskActivity(currentUser.userId, currentUser.userName, "task_update", data.title);
	} catch (error) {
		console.error("Error logging task update:", error);
	}

	return updatedTask;
};

export const deleteTask = async (id: string) => {
	// 削除前にタスク情報を取得（履歴記録用）
	let taskTitle = "";
	try {
		const taskToDelete = await db.select({ title: tasks.title }).from(tasks).where(eq(tasks.id, id));
		if (taskToDelete.length > 0) {
			taskTitle = taskToDelete[0].title;
		}
	} catch (error) {
		console.error("Error getting task title for deletion:", error);
	}

	const deletedTask = await db.delete(tasks).where(eq(tasks.id, id));

	// ユーザ操作履歴を記録
	try {
		const currentUser = await getCurrentUser();
		await logTaskActivity(currentUser.userId, currentUser.userName, "task_delete", taskTitle);
	} catch (error) {
		console.error("Error logging task deletion:", error);
	}

	return deletedTask;
};
