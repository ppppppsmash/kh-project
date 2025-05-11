"use server";

import { db } from "@/db";
import { clubActivity } from "@/db/schema/club-activity";
import { eq } from "drizzle-orm";
import { ClubFormValues } from "@/lib/validations";

export const createClubActivity = async (data: ClubFormValues) => {
  const club = await db.insert(clubActivity).values(data).returning();

  return club;
};

export const getClubActivity = async (): Promise<ClubFormValues[]> => {
  const clubs = await db.select().from(clubActivity);

  return clubs.map((club) => ({
    ...club,
    status: club.status as ClubFormValues["status"],
    description: club.description ?? undefined,
    memberCount: club.memberCount ?? "",
    activityType: club.activityType ?? undefined,
    location: club.location ?? undefined,
    detail: club.detail ?? undefined,
  }));
};

export const getClubActivityById = async (id: string) => {
  const club = await db
    .select()
    .from(clubActivity)
    .where(eq(clubActivity.id, id))
    .then((rows) => rows[0]);

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
