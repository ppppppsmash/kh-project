"use server";

import { db } from "@/db";
import { tabs } from "@/db/schema/tabs";
import { eq } from "drizzle-orm";

export const createTab = async (name: string) => {
  return await db.insert(tabs).values({ name }).returning();
};

export const updateTab = async (id: string, name: string) => {
  return await db.update(tabs).set({ name }).where(eq(tabs.id, id)).returning();
};

export const deleteTab = async (id: string) => {
  return await db.delete(tabs).where(eq(tabs.id, id)).returning();
};

export const getTabs = async () => {
  try {
    const result = await db.select().from(tabs).orderBy(tabs.createdAt);
    return result;
  } catch (error) {
    console.error("Error fetching tabs:", error);
    return [];
  }
};
