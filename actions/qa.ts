"use server";

import { db } from "@/db";
import { qa } from "@/db/shecma/qa";
import { eq } from "drizzle-orm";
import type { Qa } from "@/types";
import { QaFormValues } from "@/lib/validations";

export const getQA = async (): Promise<Qa[]> => {
  const qaData = await db.select().from(qa);
  return qaData.map((q) => ({
    ...q,
    createdAt: q.createdAt ?? new Date(),
    updatedAt: q.updatedAt ?? new Date(),
    questionBy: q.questionBy ?? undefined,
    answeredBy: q.answeredBy ?? undefined,
  }));
};

export const createQA = async (data: QaFormValues) => {
  const newQA = await db.insert(qa).values({
    ...data,
    answer: data.answer ?? "",
  }).returning();

  return newQA;
};

export const updateQA = async (id: string, data: QaFormValues) => {
  const updatedQA = await db.update(qa).set({
    ...data,
    answer: data.answer ?? "",
  }).where(eq(qa.id, id)).returning();

  return updatedQA;
};

export const deleteQA = async (id: string) => {
  const deletedQA = await db.delete(qa).where(eq(qa.id, id));

  return deletedQA;
};
