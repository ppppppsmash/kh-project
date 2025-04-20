"use server";

import { db } from "@/db";
import { member } from "@/db/shecma/member";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/uploadImage";
import type { Member } from "@/types";
type IntroCardFormValues = {
  name: string;
  department: string;
  position: string;
  hobby: string;
  skills: string;
  freeText: string;
  photo: File | null;
};

export const createIntroCard = async (data: IntroCardFormValues) => {
  let photoUrl = null;
  
  if (data.photo) {
    photoUrl = await uploadImage(data.photo);
  }

  const [newMember] = await db.insert(member).values({
    name: data.name,
    department: data.department,
    position: data.position,
    hobby: data.hobby,
    skills: data.skills,
    freeText: data.freeText,
    photoUrl: photoUrl,
  }).returning();

  revalidatePath("/member/intro-card");
  return newMember;
};

export const getIntroCards = async (): Promise<Member[]> => {
  const members = await db.select().from(member);
  return members.map((member) => ({
    ...member,
    photoUrl: member.photoUrl ?? undefined,
    freeText: member.freeText ?? undefined,
    createdAt: member.createdAt ?? new Date(),
    updatedAt: member.updatedAt ?? new Date(),
  }));
};

export const getIntroCardById = async (id: string) => {
  const [memberData] = await db.select().from(member).where(eq(member.id, id));
  return memberData;
};
