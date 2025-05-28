"use server";

import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { revalidatePath } from "next/cache";

export async function addCategory(name: string) {
  try {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: name,
      })
      .returning();

    revalidatePath("/");
    return { success: true, category: newCategory };
  } catch (error) {
    console.error("カテゴリーの追加に失敗しました:", error);
    return { success: false, error: "カテゴリーの追加に失敗しました" };
  }
}
