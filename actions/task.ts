"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import type { TaskFormValues } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { sendSlackMessage } from "@/lib/slackMessage";

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

	await sendSlackMessage({ message: `${taskData.title}` });

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

	return updatedTask;
};

export const deleteTask = async (id: string) => {
	const deletedTask = await db.delete(tasks).where(eq(tasks.id, id));

	return deletedTask;
};
