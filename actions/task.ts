"use server";

import { TaskFormValues } from "@/lib/validations";
import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import { eq } from "drizzle-orm";

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
  const taskData = {
    ...data,
    tabId: data.tabId,
    link: data.link ?? "",
    notes: data.notes ?? "",
    startedAt: data.startedAt ?? new Date(),
    createdAt: null,
    updatedAt: null,
  }
  const newTask = await db.insert(tasks).values(taskData).returning();

  return newTask;
};

export const updateTask = async (id: string, data: TaskFormValues) => {
  const updatedTask = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();

  return updatedTask;
};

export const deleteTask = async (id: string) => {
  const deletedTask =  await db.delete(tasks).where(eq(tasks.id, id));

  return deletedTask;
};
