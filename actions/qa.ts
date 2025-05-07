"use server";

import { db } from "@/db";
import { qa } from "@/db/shecma/qa";
import { eq, desc } from "drizzle-orm";
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
  // 最新のquestionCodeを取得
  const lastQaRecord = await db
    .select({ questionCode: qa.questionCode })
    .from(qa)
    .orderBy(desc(qa.questionCode))
    .limit(1);

  // 初期コード
  let questionCode = "QA001";

  // 既存データがある場合は次の番号を生成
  if (lastQaRecord.length > 0 && lastQaRecord[0].questionCode) {
    const match = lastQaRecord[0].questionCode.match(/QA(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1], 10) + 1;
      questionCode = `QA${nextNumber.toString().padStart(3, "0")}`;
    }
  }

  // 挿入用のデータを構築
  const insertData = {
    questionCode,
    question: data.question,
    answer: data.answer ?? "",
    category: data.category,
    questionBy: data.questionBy ?? null,
    answeredBy: data.answeredBy ?? null,
  };

  const inserted = await db.insert(qa).values(insertData).returning();
  return inserted[0];
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
