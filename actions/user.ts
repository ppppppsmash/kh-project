"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Role, User } from "@/types";
import { uploadImage } from "@/lib/uploadImage";

type Account = {
  id: string;
  name: string;
  image: string;
  email: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

type CreateUserInput = {
  name: string;
  email: string;
  image: string;
  role?: Role;
};

export interface PhotoInUser extends User {
  photo: File;
}

export const getUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user[0];
}

export const getUserInfo = async (): Promise<User | undefined> => {
  const session = await auth();

  if (!session?.user?.email) {
    return undefined;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email));

  if (!user[0]) {
    return undefined;
  }

  return {
    ...user[0],
    role: user[0].role as Role,
    department: user[0].department as string,
    position: user[0].position as string,
    hobby: user[0].hobby as string,
    skills: user[0].skills as string,
    freeText: user[0].freeText as string,
    photoUrl: user[0].photoUrl as string,
    isActive: user[0].isActive as boolean,
    joinDate: user[0].joinDate as Date,
    leaveDate: user[0].leaveDate as Date,
    editedAt: user[0].editedAt as Date,
    createdAt: user[0].createdAt as Date,
    updatedAt: user[0].updatedAt as Date,
  };
}

export const existsUser = async (email: string) => {
  const user = await db.select().from(users).where(eq(users.email, email));
  return user.length > 0;
}

export const createUser = async (
  data: CreateUserInput
): Promise<Account | undefined> => {
  try {
    // 既存のユーザーを確認
    const existingUser = await getUser(data.email);
    if (existingUser) {
      // 既存ユーザーの場合、updatedAtを更新
      const [updatedUser] = await db
        .update(users)
        .set({
          updatedAt: new Date(),
          name: data.name,
          image: data.image,
        })
        .where(eq(users.email, data.email))
        .returning();

      return {
        ...updatedUser,
        role: updatedUser.role as Role | undefined,
      };
    }

    // 新規ユーザーの場合のみ作成
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        role: data.role || "user",
      })
      .returning();

    return {
      ...user,
      role: user.role as Role | undefined,
    };
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

export const getUserRole = async (email: string): Promise<Role> => {
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

    return user[0].role as Role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user"; // エラーの場合もデフォルトのロールを返す
  }
};

export const getUserList = async (): Promise<User[]> => {
  const usersData = await db.select().from(users);
  return usersData.map((user) => ({
    ...user,
    role: user.role as Role,
    department: user.department as string,
    position: user.position as string,
    hobby: user.hobby as string,
    skills: user.skills as string,
    freeText: user.freeText as string,
    photoUrl: user.photoUrl as string,
    isActive: user.isActive as boolean,
    joinDate: user.joinDate as Date,
    leaveDate: user.leaveDate as Date,
    editedAt: user.editedAt as Date,
    createdAt: user.createdAt as Date,
    updatedAt: user.updatedAt as Date,
  }));
};

export const updateUserInfo = async (id: string, data: Omit<PhotoInUser, "id" | "createdAt" | "updatedAt" | "image" | "email"> ) => {
  if (data.photo) {
    const photoUrl = await uploadImage(data.photo);
    console.log(photoUrl);
    data.photoUrl = photoUrl;
  }

  const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return updatedUser;
};
