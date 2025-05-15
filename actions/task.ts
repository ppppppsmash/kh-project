"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import type { TaskFormValues } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";

export const getTasks = async (tabId?: string): Promise<TaskFormValues[]> => {
	if (tabId) {
		const result = await db.select().from(tasks).where(eq(tasks.tabId, tabId));
		return result.map((task) => ({
			...task,
			progress: task.progress as TaskFormValues["progress"],
			progressDetails: task.progressDetails || "",
			category: task.category || "",
			startedAt: task.startedAt || new Date(),
			completedAt: task.completedAt || null,
			createdAt: task.createdAt || new Date(),
			updatedAt: task.updatedAt || new Date(),
		}));
	}
	return [];
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
		tabId: data.tabId,
		link: data.link ?? "",
		notes: data.notes ?? "",
		startedAt: data.startedAt ?? new Date(),
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	const newTask = await db.insert(tasks).values(taskData).returning();

	return newTask;
};

export const updateTask = async (id: string, data: TaskFormValues) => {
	const updatedTask = await db
		.update(tasks)
		.set(data)
		.where(eq(tasks.id, id))
		.returning();

	return updatedTask;
};

export const deleteTask = async (id: string) => {
	const deletedTask = await db.delete(tasks).where(eq(tasks.id, id));

	return deletedTask;
};
