"use server";

import type { User } from "@/types";
import { db } from "@/db";
import { users } from "@/db/shecma";
import { eq } from "drizzle-orm";

export const getUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0];
}

export const existsUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user.length > 0;
}

export const createUser = async (user: User) => {
  const exists = await existsUser(user.email);

  if (exists) {
    // 既存ユーザーの更新
    await db.update(users).set({
      name: user.name,
      image: user.image,
      updatedAt: new Date(),
    }).where(eq(users.email, user.email));
  } else {
    // 新規ユーザーの追加
    await db.insert(users).values({
      name: user.name,
      image: user.image,
      email: user.email,
    });
  }

  // // IDを取得
  // const savedUser = await getUser(user.email);
  // if (!savedUser) return;

  // // アクティビティを記録
  // await createUserActivity({
  //   userId: savedUser.id,
  //   userName: savedUser.name,
  //   action: "login",
  // });
};
