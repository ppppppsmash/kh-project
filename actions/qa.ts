"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { qa } from "@/db/schema/qa";
import type { QaFormValues } from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { logQaActivity } from "./user-activity";

export const getQA = async (): Promise<QaFormValues[]> => {
	const qaData = await db.select().from(qa);
	return qaData.map((q) => ({
		...q,
		isPublic: q.isPublic ?? false,
		questionBy: q.questionBy ?? undefined,
		answeredBy: q.answeredBy ?? undefined,
		startedAt: q.startedAt ?? new Date(),
		createdAt: q.createdAt ?? new Date(),
		updatedAt: q.updatedAt ?? new Date(),
	}));
};

export const createQA = async (data: QaFormValues) => {
	const session = await auth();
	const currentUser = session?.user?.name;
	const currentUserId = session?.user?.id;

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
			const nextNumber = Number.parseInt(match[1], 10) + 1;
			questionCode = `QA${nextNumber.toString().padStart(3, "0")}`;
		}
	}

	// 挿入用のデータを構築
	const insertData = {
		questionCode,
		question: data.question,
		answer: data.answer || "",
		category: data.category,
		isPublic: data.isPublic,
		questionBy: data.questionBy ? data.questionBy : (currentUser ?? null),
		answeredBy: data.answer ? currentUser : null,
		startedAt: data.startedAt ?? new Date(),
	};

	const inserted = await db.insert(qa).values(insertData).returning();

	// ユーザ操作履歴を記録
	if (currentUserId && currentUser) {
		try {
			await logQaActivity(
				currentUserId, 
				currentUser, 
				"qa_create", 
				inserted[0]?.id,
				data.question,
				{
					questionCode,
					category: data.category,
					isPublic: data.isPublic,
					questionBy: data.questionBy || currentUser,
					answeredBy: data.answer ? currentUser : null,
					startedAt: data.startedAt
				}
			);
		} catch (error) {
			console.error("Error logging QA creation:", error);
		}
	}

	return inserted[0];
};

export const updateQA = async (id: string, data: QaFormValues) => {
	const session = await auth();
	const currentUser = session?.user?.name;
	const currentUserId = session?.user?.id;

	// 更新前のQA情報を取得（変更内容の比較用）
	let oldQaData = null;
	try {
		const oldQa = await db.select().from(qa).where(eq(qa.id, id));
		if (oldQa.length > 0) {
			oldQaData = oldQa[0];
		}
	} catch (error) {
		console.error("Error getting old QA data:", error);
	}

	const updatedQA = await db
		.update(qa)
		.set({
			...data,
			answer: data.answer ?? "",
			answeredBy: currentUser ?? null,
		})
		.where(eq(qa.id, id))
		.returning();

	// ユーザ操作履歴を記録
	if (currentUserId && currentUser) {
		try {
			const changeDetails = oldQaData ? {
				oldData: {
					question: oldQaData.question,
					answer: oldQaData.answer,
					category: oldQaData.category,
					isPublic: oldQaData.isPublic,
					questionBy: oldQaData.questionBy,
					answeredBy: oldQaData.answeredBy
				},
				newData: {
					question: data.question,
					answer: data.answer,
					category: data.category,
					isPublic: data.isPublic,
					questionBy: data.questionBy,
					answeredBy: currentUser
				}
			} : undefined;

			await logQaActivity(
				currentUserId, 
				currentUser, 
				"qa_update", 
				id,
				data.question,
				changeDetails
			);
		} catch (error) {
			console.error("Error logging QA update:", error);
		}
	}

	return updatedQA;
};

export const deleteQA = async (id: string) => {
	// 削除前にQA情報を取得（履歴記録用）
	let qaQuestion = "";
	let qaDetails = null;
	try {
		const qaToDelete = await db.select().from(qa).where(eq(qa.id, id));
		if (qaToDelete.length > 0) {
			const qaItem = qaToDelete[0];
			qaQuestion = qaItem.question;
			qaDetails = {
				questionCode: qaItem.questionCode,
				category: qaItem.category,
				isPublic: qaItem.isPublic,
				questionBy: qaItem.questionBy,
				answeredBy: qaItem.answeredBy,
				startedAt: qaItem.startedAt
			};
		}
	} catch (error) {
		console.error("Error getting QA question for deletion:", error);
	}

	const deletedQA = await db.delete(qa).where(eq(qa.id, id));

	// ユーザ操作履歴を記録
	const session = await auth();
	const currentUser = session?.user?.name;
	const currentUserId = session?.user?.id;
	
	if (currentUserId && currentUser) {
		try {
			await logQaActivity(
				currentUserId, 
				currentUser, 
				"qa_delete", 
				id,
				qaQuestion,
				qaDetails || undefined
			);
		} catch (error) {
			console.error("Error logging QA deletion:", error);
		}
	}

	return deletedQA;
};
