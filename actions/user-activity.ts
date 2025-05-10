"use server";

import { db } from "@/db";
import { userActivity } from "@/db/schema/user-activity";
import { desc } from "drizzle-orm";
import type { UserActivity, UserActivityAction } from "@/types";
import { cache } from "react";

type CreateUserActivityInput = {
  userId: string;
  userName: string;
  action: UserActivityAction;
};

// キャッシュを使用してデータ取得を最適化
export const getUserActivity = cache(async (): Promise<UserActivity[]> => {
  try {
    // 必要なカラムのみを選択
    const activities = await db
      .select({
        id: userActivity.id,
        userId: userActivity.userId,
        userName: userActivity.userName,
        action: userActivity.action,
        createdAt: userActivity.createdAt,
      })
      .from(userActivity)
      .orderBy(desc(userActivity.createdAt))
      .limit(10);

    return activities.map((activity) => ({
      ...activity,
      action: activity.action as UserActivityAction,
      createdAt: activity.createdAt ?? new Date(),
    }));
  } catch (error) {
    console.error("Error fetching user activity:", error);
    throw error;
  }
});

export const createUserActivity = async (data: CreateUserActivityInput) => {
  const newActivity = await db.insert(userActivity)
    .values({
      userId: data.userId,
      userName: data.userName,
      action: data.action,
    })
    .returning();

  return newActivity;
};
