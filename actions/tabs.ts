"use server";

import { db } from "@/db";
import { tabs } from "@/db/schema/tabs";
import { tasks } from "@/db/schema/tasks";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";

export const getTabs = async () => {
  const result = await db.select().from(tabs).orderBy(desc(tabs.name));
  return result.map((tab) => ({
    ...tab,
    name: tab.name || "",
    createdAt: tab.createdAt || new Date(),
    updatedAt: tab.updatedAt || new Date(),
  }));
};

export const addTab = async (name: string) => {
  try {
    const [newTab] = await db
      .insert(tabs)
      .values({
        name: name,
      })
      .returning();

    revalidatePath("/");
    return { success: true, tab: newTab };
  } catch (error) {
    console.error("タブの追加に失敗しました:", error);
    return { success: false, error: "タブの追加に失敗しました" };
  }
};

export const deleteTab = async (id: string) => {
  try {
    // タブに紐づいているタスクを未完了タスクのまま
    await db
      .update(tasks)
      .set({ tabId: null })
      .where(eq(tasks.tabId, id));

    // タブを削除
    await db
      .delete(tabs)
      .where(eq(tabs.id, id));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("タブの削除に失敗しました:", error);
    return { success: false, error: "タブの削除に失敗しました" };
  }
}
