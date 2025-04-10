"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type User = {
  name: string;
  image: string;
  email: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
    await db.update(users).set({
      name: user.name,
      image: user.image,
      updatedAt: new Date(),
    }).where(eq(users.email, user.email));
  } else {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
}
