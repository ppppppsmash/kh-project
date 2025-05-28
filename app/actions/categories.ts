"use server";

import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import type { CategoryValues } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getCategories = async (): Promise<CategoryValues[]> => {
	const result = await db.select().from(categories).orderBy(desc(categories.name));

	return result.map((category) => ({
		...category,
		name: category.name || "",
		createdAt: category.createdAt || new Date(),
	}));
};

export const getCategory = async (id: string): Promise<CategoryValues[]> => {
	const result = await db.select().from(categories).where(eq(categories.id, id));

	return result.map((category) => ({
		...category,
		name: category.name || "",
		createdAt: category.createdAt || new Date(),
	}));
};

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
