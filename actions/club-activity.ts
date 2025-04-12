"use server";

import { db } from "@/db";
import { clubActivity } from "@/db/shecma/club-activity";
import { eq } from "drizzle-orm";
import { ClubFormValues } from "@/lib/validations";
import { ClubStatus } from "@/types";
export const createClubActivity = async (data: ClubFormValues) => {
  const club = await db.insert(clubActivity).values(data).returning();
  return club;
};

export const getClubActivity = async () => {
  const clubs = await db.select().from(clubActivity);
  return clubs.map((club) => ({
    ...club,
    status: club.status as ClubStatus,
  }));
};

export const updateClubActivity = async (id: string, data: ClubFormValues) => {
  const club = await db.update(clubActivity).set(data).where(eq(clubActivity.id, id)).returning();
  return club;
};

export const deleteClubActivity = async (id: string) => {
  const club = await db.delete(clubActivity).where(eq(clubActivity.id, id));
  return club;
};
