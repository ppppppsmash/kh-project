"use server";

import { db } from "@/db";
import { tasks } from "@/db/shecma/tasks";
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
  const [newTask] = await db.insert(tasks).values(data).returning();
  return newTask;
};

