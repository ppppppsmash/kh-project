"use server";

import { db } from "@/db";
import { users } from "@/db/shecma";
import { eq } from "drizzle-orm";

type User = {
  id: string;
  name: string;
  image: string;
  email: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CreateUserInput = {
  name: string;
  email: string;
  image: string;
  role?: string;
};

export const getUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0];
}

export const existsUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user.length > 0;
}

export const createUser = async (
  data: CreateUserInput
): Promise<User | undefined> => {
  try {
    // 既存のユーザーを確認
    const existingUser = await getUser(data.email);

    if (existingUser) {
      return existingUser;
    }

    // 新規ユーザーの場合のみ作成
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        role: data.role || "user", // ロールが指定されていない場合はデフォルト値を使用
      })
      .returning();

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return undefined;
  }
};

export const getUserRole = async (email: string): Promise<"admin" | "user"> => {
  try {
    const user = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      // ユーザーが存在しない場合はデフォルトのロールを返す
      return "user";
    }

    return user[0].role as "admin" | "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user"; // エラーの場合もデフォルトのロールを返す
  }
}
