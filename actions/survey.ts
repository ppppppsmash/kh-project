"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { surveys, surveyItems } from "@/db/schema/surveys";
import { surveyResponses, surveyResponseItems } from "@/db/schema/surveys/responses";
import type { SurveyFormValues, SurveyItemFormValues } from "@/lib/validations";
import { desc, eq, inArray, asc, and, sql } from "drizzle-orm";

export const getSurveys = async (): Promise<SurveyFormValues[]> => {
	const surveysData = await db.select().from(surveys).orderBy(desc(surveys.createdAt));
	const itemsData = await db.select().from(surveyItems);

	return surveysData.map((survey) => ({
		id: survey.id,
		title: survey.title,
		description: survey.description ?? undefined,
		theme: survey.theme ?? "default",
		isPublished: survey.isPublished ?? false,
		items: itemsData
			.filter((item) => item.surveyId === survey.id)
			.map((item) => ({
				id: item.id,
				surveyId: item.surveyId,
				question: item.question,
				questionType: item.questionType as "text" | "textarea" | "select" | "radio" | "checkbox",
				options: item.options ?? undefined,
				isRequired: item.isRequired ?? false,
				order: item.order ?? "0",
				// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
			}))
			.sort((a, b) => Number.parseInt(a.order || "0", 10) - Number.parseInt(b.order || "0", 10)),
		// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
	}));
};

export const getSurvey = async (id: string): Promise<SurveyFormValues | null> => {
	const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
	if (!survey) return null;

	const items = await db
		.select()
		.from(surveyItems)
		.where(eq(surveyItems.surveyId, id))
		.orderBy(surveyItems.order);

	return {
		id: survey.id,
		title: survey.title,
		description: survey.description ?? undefined,
		theme: survey.theme ?? "default",
		isPublished: survey.isPublished ?? false,
		items: items.map((item) => ({
			id: item.id,
			surveyId: item.surveyId,
			question: item.question,
			questionType: item.questionType as "text" | "textarea" | "select" | "radio" | "checkbox",
			options: item.options ?? undefined,
			isRequired: item.isRequired ?? false,
			order: item.order ?? "0",
			// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
		})),
		// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
	};
};

export const getPublicSurvey = async (id: string): Promise<SurveyFormValues | null> => {
	const surveysData = await db
		.select()
		.from(surveys)
		.where(eq(surveys.id, id));
	
	const survey = surveysData.find((s) => s.isPublished === true);
	if (!survey) return null;

	const items = await db
		.select()
		.from(surveyItems)
		.where(eq(surveyItems.surveyId, id))
		.orderBy(surveyItems.order);

	return {
		id: survey.id,
		title: survey.title,
		description: survey.description ?? undefined,
		theme: survey.theme ?? "default",
		isPublished: survey.isPublished ?? false,
		items: items.map((item) => ({
			id: item.id,
			surveyId: item.surveyId,
			question: item.question,
			questionType: item.questionType as "text" | "textarea" | "select" | "radio" | "checkbox",
			options: item.options ?? undefined,
			isRequired: item.isRequired ?? false,
			order: item.order ?? "0",
			// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
		})),
		// createdAtとupdatedAtは除外（Hydrationエラーを防ぐ）
	};
};

export const createSurvey = async (data: SurveyFormValues) => {
	const { items, ...surveyData } = data;

	const [newSurvey] = await db
		.insert(surveys)
		.values({
			title: surveyData.title,
			description: surveyData.description,
			theme: surveyData.theme || "default",
			isPublished: surveyData.isPublished ?? false,
		})
		.returning();

	if (items && items.length > 0) {
		await db.insert(surveyItems).values(
			items.map((item, index) => ({
				surveyId: newSurvey.id,
				question: item.question,
				questionType: item.questionType,
				options: item.options || null,
				isRequired: item.isRequired ?? false,
				order: item.order || index.toString(),
			}))
		);
	}

	return newSurvey;
};

export const updateSurvey = async (id: string, data: SurveyFormValues) => {
	const { items, ...surveyData } = data;

	await db
		.update(surveys)
		.set({
			title: surveyData.title,
			description: surveyData.description,
			theme: surveyData.theme || "default",
			isPublished: surveyData.isPublished ?? false,
			updatedAt: new Date(),
		})
		.where(eq(surveys.id, id));

	// 既存の項目を削除
	await db.delete(surveyItems).where(eq(surveyItems.surveyId, id));

	// 新しい項目を追加
	if (items && items.length > 0) {
		await db.insert(surveyItems).values(
			items.map((item, index) => ({
				surveyId: id,
				question: item.question,
				questionType: item.questionType,
				options: item.options || null,
				isRequired: item.isRequired ?? false,
				order: item.order || index.toString(),
			}))
		);
	}

	return { id };
};

export const deleteSurvey = async (id: string) => {
	await db.delete(surveys).where(eq(surveys.id, id));
	return { id };
};

// アンケート回答を保存
export const submitSurveyResponse = async (
	surveyId: string,
	answers: Record<string, string | string[]>
) => {
	// 回答者名を取得（ログインしている場合は取得、匿名の場合はnull）
	const session = await auth();
	const respondentName = session?.user?.name || null;

	// 回答セッションを作成
	const [response] = await db
		.insert(surveyResponses)
		.values({
			surveyId,
			respondentName,
		})
		.returning();

	// 各回答項目を保存
	const responseItems = Object.entries(answers).map(([surveyItemId, answer]) => ({
		responseId: response.id,
		surveyItemId,
		answer: Array.isArray(answer) ? JSON.stringify(answer) : answer,
	}));

	if (responseItems.length > 0) {
		await db.insert(surveyResponseItems).values(responseItems);
	}

	return response;
};

// アンケートの回答一覧を取得
export const getSurveyResponses = async (surveyId: string) => {
	const responses = await db
		.select()
		.from(surveyResponses)
		.where(eq(surveyResponses.surveyId, surveyId))
		.orderBy(desc(surveyResponses.submittedAt));

	if (responses.length === 0) return [];

	const responseIds = responses.map((r) => r.id);
	const responseItems = await db
		.select()
		.from(surveyResponseItems)
		.where(inArray(surveyResponseItems.responseId, responseIds));

	// 質問項目の順番を取得（数値としてソート）
	const surveyItemsData = await db
		.select()
		.from(surveyItems)
		.where(eq(surveyItems.surveyId, surveyId))
		.orderBy(sql`${surveyItems.order}::integer`);

	// 質問IDと順番のマッピング
	const itemOrderMap = new Map<string, number>();
	surveyItemsData.forEach((item, index) => {
		if (item.id) {
			itemOrderMap.set(item.id, Number.parseInt(item.order || "0", 10));
		}
	});

	return responses.map((response) => ({
		id: response.id,
		surveyId: response.surveyId,
		respondentName: response.respondentName,
		submittedAt: response.submittedAt,
		items: responseItems
			.filter((item) => item.responseId === response.id)
			.map((item) => ({
				surveyItemId: item.surveyItemId,
				answer: item.answer,
			}))
			.sort((a, b) => {
				const orderA = itemOrderMap.get(a.surveyItemId) ?? 999;
				const orderB = itemOrderMap.get(b.surveyItemId) ?? 999;
				return orderA - orderB;
			}),
	}));
};
