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
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoNothing()
    .returning();

  if (!user) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    return existing;
  }

  return user;
};
