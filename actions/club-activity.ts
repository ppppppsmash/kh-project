"use server";

import { db } from "@/db";
import { clubActivity } from "@/db/shecma/club-activity";
import { eq } from "drizzle-orm";
import { ClubFormValues } from "@/lib/validations";

export const createClubActivity = async (data: ClubFormValues) => {
  const club = await db.insert(clubActivity).values(data).returning();
  return club;
};

export const getClubActivity = async () => {
  const club = await db.select().from(clubActivity);
  return club;
};

export const updateClubActivity = async (id: string, data: ClubFormValues) => {
  const club = await db.update(clubActivity).set(data).where(eq(clubActivity.id, id)).returning();
  return club;
};

export const deleteClubActivity = async (id: string) => {
  const club = await db.delete(clubActivity).where(eq(clubActivity.id, id));
  return club;
};
