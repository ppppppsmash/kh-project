"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema/tasks";
import { eq } from "drizzle-orm";
import type { Task, TaskProgress } from "@/types";

export const getTasks = async (): Promise<Task[]> => {
  const taskData = await db.select().from(tasks);

  return taskData.map((task) => ({
    ...task,
    createdAt: task.createdAt ?? new Date(),
    updatedAt: task.updatedAt ?? new Date(),
    progress: task.progress as TaskProgress,
    completedAt: task.completedAt ?? undefined,
  }));
};

export const createTask = async (data: Task) => {
  const newTask = await db.insert(tasks).values(data).returning();

  return newTask;
};

export const updateTask = async (id: string, data: Task) => {
  const updatedTask = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();

  return updatedTask;
};

export const deleteTask = async (id: string) => {
  const deletedTask =  await db.delete(tasks).where(eq(tasks.id, id));

  return deletedTask;
};
