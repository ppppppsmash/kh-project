"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import type { TaskFormValues } from "@/lib/validations";
import { desc, eq, sql } from "drizzle-orm";
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

// 一意のタスクIDを生成する関数（日付ベースの形式）
const generateUniqueTaskId = async (): Promise<string> => {
	const now = new Date();
	// 日付をYYYYMMDD
	const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
	const prefix = `T-${dateStr}-`;
	
	// 当日作成されたタスクの最大番号を取得
	const pattern = `${prefix}%`;
	const todayTasks = await db
		.select({ taskId: tasks.taskId })
		.from(tasks)
		.where(sql`${tasks.taskId} LIKE ${pattern}`)
		.orderBy(desc(tasks.taskId))
		.limit(1);

	let nextNumber = 1;
	if (todayTasks.length > 0 && todayTasks[0].taskId) {
		// T-YYYYMMDD-XXX形式から番号を抽出
		const match = todayTasks[0].taskId.match(/T-\d{8}-(\d+)/);
		if (match) {
			nextNumber = Number.parseInt(match[1], 10) + 1;
		}
	}

	// T-YYYYMMDD-XXX
	return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
};

export const createTask = async (data: TaskFormValues) => {
	// 一意のIDを生成（重複チェック付き）
	let taskId: string;
	let attempts = 0;
	const maxAttempts = 10;

	do {
		taskId = await generateUniqueTaskId();
		// 既存のタスクIDと重複していないか確認
		const existingTask = await db
			.select({ taskId: tasks.taskId })
			.from(tasks)
			.where(eq(tasks.taskId, taskId))
			.limit(1);

		if (existingTask.length === 0) {
			break; // 重複なし
		}

		attempts++;
		if (attempts >= maxAttempts) {
			// 最大試行回数に達した場合、タイムスタンプベースのIDを使用
			const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
			taskId = `T-${dateStr}-${Date.now().toString().slice(-6)}`;
			break;
		}
	} while (attempts < maxAttempts);

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
		await logTaskActivity(
			currentUser.userId, 
			currentUser.userName, 
			"task_create", 
			newTask[0]?.id,
			data.title,
			{
				taskId: taskId,
				assignee: data.assignee,
				dueDate: data.dueDate,
				progress: data.progress,
				priority: data.priority,
				categoryId: data.categoryId,
				content: data.content,
				notes: data.notes,
				tabId: data.tabId,
				link: data.link,
				startedAt: data.startedAt,
				completedAt: data.completedAt,
				updatedAt: newTask[0]?.updatedAt,
				createdAt: newTask[0]?.createdAt
			}
		);
	} catch (error) {
		console.error("Error logging task creation:", error);
	}

	return newTask;
};

export const updateTask = async (id: string, data: TaskFormValues) => {
	// 更新前のタスク情報を取得（変更内容の比較用）
	let oldTaskData = null;
	try {
		const oldTask = await db.select().from(tasks).where(eq(tasks.id, id));
		if (oldTask.length > 0) {
			oldTaskData = oldTask[0];
		}
	} catch (error) {
		console.error("Error getting old task data:", error);
	}

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
		const changeDetails = oldTaskData ? {
			oldData: {
				title: oldTaskData.title,
				assignee: oldTaskData.assignee,
				dueDate: oldTaskData.dueDate,
				progress: oldTaskData.progress,
				priority: oldTaskData.priority,
				content: oldTaskData.content,
				progressDetails: oldTaskData.progressDetails,
				notes: oldTaskData.notes,
				link: oldTaskData.link,
				startedAt: oldTaskData.startedAt,
				completedAt: oldTaskData.completedAt,
				updatedAt: oldTaskData.updatedAt,
				createdAt: oldTaskData.createdAt
			},
			newData: {
				title: data.title,
				assignee: data.assignee,
				dueDate: data.dueDate,
				progress: data.progress,
				priority: data.priority,
				content: data.content,
				progressDetails: data.progressDetails,
				notes: data.notes,
				link: data.link,
				startedAt: data.startedAt,
				completedAt: data.completedAt,
				updatedAt: data.updatedAt,
				createdAt: data.createdAt
			}
		} : undefined;

		await logTaskActivity(
			currentUser.userId, 
			currentUser.userName, 
			"task_update", 
			id,
			data.title,
			changeDetails
		);
	} catch (error) {
		console.error("Error logging task update:", error);
	}

	return updatedTask;
};

export const deleteTask = async (id: string) => {
	// 削除前にタスク情報を取得（履歴記録用）
	let taskTitle = "";
	let taskDetails = null;
	try {
		const taskToDelete = await db.select().from(tasks).where(eq(tasks.id, id));
		if (taskToDelete.length > 0) {
			const task = taskToDelete[0];
			taskTitle = task.title;
			taskDetails = {
				taskId: task.taskId,
				assignee: task.assignee,
				dueDate: task.dueDate,
				progress: task.progress,
				priority: task.priority,
				content: task.content,
				notes: task.notes,
				link: task.link,
				categoryId: task.categoryId,
				tabId: task.tabId,
				startedAt: task.startedAt,
				completedAt: task.completedAt
			};
		}
	} catch (error) {
		console.error("Error getting task title for deletion:", error);
	}

	const deletedTask = await db.delete(tasks).where(eq(tasks.id, id));

	// ユーザ操作履歴を記録
	try {
		const currentUser = await getCurrentUser();
		await logTaskActivity(
			currentUser.userId, 
			currentUser.userName, 
			"task_delete", 
			id,
			taskTitle,
			taskDetails || undefined
		);
	} catch (error) {
		console.error("Error logging task deletion:", error);
	}

	return deletedTask;
};
