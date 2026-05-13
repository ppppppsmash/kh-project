"use server";

import { db } from "@/db";
import { agendaItems, meetings } from "@/db/schema/meetings";
import type {
	AgendaItemFormValues,
	MeetingFormValues,
} from "@/lib/validations";
import { asc, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "./auth-helper";
import { logAgendaActivity, logMeetingActivity } from "./user-activity";

const generateShareToken = () => {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}
	// 念のためのフォールバック
	return Array.from({ length: 32 }, () =>
		Math.floor(Math.random() * 36).toString(36),
	).join("");
};

const mapAgendaRow = (r: typeof agendaItems.$inferSelect): AgendaItemFormValues => ({
	...r,
	description: r.description ?? undefined,
	parentId: r.parentId ?? null,
	presenterId: r.presenterId ?? null,
	memo: r.memo ?? null,
	linkedTaskId: r.linkedTaskId ?? null,
	linkedQaId: r.linkedQaId ?? null,
	createdAt: r.createdAt ?? new Date(),
	updatedAt: r.updatedAt ?? new Date(),
});

export const getMeetings = async (): Promise<MeetingFormValues[]> => {
	const rows = await db
		.select()
		.from(meetings)
		.orderBy(desc(meetings.scheduledAt), desc(meetings.createdAt));
	const allItems = await db
		.select()
		.from(agendaItems)
		.orderBy(asc(agendaItems.order), asc(agendaItems.createdAt));
	return rows.map((m) => ({
		...m,
		description: m.description ?? null,
		scheduledAt: m.scheduledAt ?? null,
		createdBy: m.createdBy ?? null,
		items: allItems.filter((it) => it.meetingId === m.id).map(mapAgendaRow),
		createdAt: m.createdAt ?? new Date(),
		updatedAt: m.updatedAt ?? new Date(),
	}));
};

export const getMeeting = async (
	id: string,
): Promise<MeetingFormValues | null> => {
	const rows = await db.select().from(meetings).where(eq(meetings.id, id));
	const m = rows[0];
	if (!m) return null;
	const items = await db
		.select()
		.from(agendaItems)
		.where(eq(agendaItems.meetingId, id))
		.orderBy(asc(agendaItems.order), asc(agendaItems.createdAt));
	return {
		...m,
		description: m.description ?? null,
		scheduledAt: m.scheduledAt ?? null,
		createdBy: m.createdBy ?? null,
		items: items.map(mapAgendaRow),
		createdAt: m.createdAt ?? new Date(),
		updatedAt: m.updatedAt ?? new Date(),
	};
};

// shareToken から公開済み会議を取得（external 用）
export const getPublicMeetingByToken = async (
	token: string,
): Promise<MeetingFormValues | null> => {
	const rows = await db
		.select()
		.from(meetings)
		.where(eq(meetings.shareToken, token));
	const m = rows[0];
	if (!m || !m.isPublic) return null;
	const items = await db
		.select()
		.from(agendaItems)
		.where(eq(agendaItems.meetingId, m.id))
		.orderBy(asc(agendaItems.order), asc(agendaItems.createdAt));
	return {
		...m,
		description: m.description ?? null,
		scheduledAt: m.scheduledAt ?? null,
		createdBy: m.createdBy ?? null,
		items: items.map(mapAgendaRow),
		createdAt: m.createdAt ?? new Date(),
		updatedAt: m.updatedAt ?? new Date(),
	};
};

export const createMeeting = async (data: MeetingFormValues) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	const insertData = {
		title: data.title,
		description: data.description ?? null,
		scheduledAt: data.scheduledAt ?? null,
		status: data.status ?? "scheduled",
		isPublic: data.isPublic ?? false,
		shareToken: generateShareToken(),
		createdBy: currentUserId !== "unknown" ? currentUserId : null,
	};

	let inserted;
	try {
		inserted = await db.insert(meetings).values(insertData).returning();
	} catch (error) {
		console.error("[createMeeting] insert failed:", error);
		throw error;
	}

	const meetingId = inserted[0]?.id;

	if (meetingId && data.items && data.items.length > 0) {
		await db.insert(agendaItems).values(
			data.items.map((it, index) => ({
				id: it.id || undefined,
				meetingId,
				parentId: it.parentId || null,
				order: it.order ?? index,
				title: it.title,
				description: it.description ?? null,
				status: it.status ?? "not_started",
				type: it.type ?? "agenda",
				presenterId: it.presenterId || null,
				memo: it.memo ?? null,
				linkedTaskId: it.linkedTaskId || null,
				linkedQaId: it.linkedQaId || null,
			})),
		);
	}

	if (currentUserId && currentUser) {
		await logMeetingActivity(
			currentUserId,
			currentUser,
			"meeting_create",
			inserted[0]?.id,
			data.title,
			{
				status: data.status,
				isPublic: data.isPublic,
				scheduledAt: data.scheduledAt,
				itemCount: data.items?.length ?? 0,
			},
		);
	}

	return inserted[0];
};

export const updateMeeting = async (id: string, data: MeetingFormValues) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	const oldRows = await db.select().from(meetings).where(eq(meetings.id, id));
	const oldData = oldRows[0];

	const updated = await db
		.update(meetings)
		.set({
			title: data.title,
			description: data.description ?? null,
			scheduledAt: data.scheduledAt ?? null,
			status: data.status ?? "scheduled",
			isPublic: data.isPublic ?? false,
		})
		.where(eq(meetings.id, id))
		.returning();

	// アジェンダ項目は survey と同じく delete-and-recreate 方式
	await db.delete(agendaItems).where(eq(agendaItems.meetingId, id));
	if (data.items && data.items.length > 0) {
		await db.insert(agendaItems).values(
			data.items.map((it, index) => ({
				id: it.id || undefined,
				meetingId: id,
				parentId: it.parentId || null,
				order: it.order ?? index,
				title: it.title,
				description: it.description ?? null,
				status: it.status ?? "not_started",
				type: it.type ?? "agenda",
				presenterId: it.presenterId || null,
				memo: it.memo ?? null,
				linkedTaskId: it.linkedTaskId || null,
				linkedQaId: it.linkedQaId || null,
			})),
		);
	}

	if (currentUserId && currentUser && oldData) {
		await logMeetingActivity(
			currentUserId,
			currentUser,
			"meeting_update",
			id,
			data.title,
			{
				oldData: {
					title: oldData.title,
					status: oldData.status,
					isPublic: oldData.isPublic,
					scheduledAt: oldData.scheduledAt,
				},
				newData: {
					title: data.title,
					status: data.status,
					isPublic: data.isPublic,
					scheduledAt: data.scheduledAt,
				},
			},
		);
	}

	return updated[0];
};

export const deleteMeeting = async (id: string) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	const oldRows = await db.select().from(meetings).where(eq(meetings.id, id));
	const oldData = oldRows[0];

	const deleted = await db.delete(meetings).where(eq(meetings.id, id));

	if (currentUserId && currentUser && oldData) {
		await logMeetingActivity(
			currentUserId,
			currentUser,
			"meeting_delete",
			id,
			oldData.title,
			{
				status: oldData.status,
				isPublic: oldData.isPublic,
			},
		);
	}

	return deleted;
};

// shareToken を再生成（漏洩時のリセット用）
export const regenerateShareToken = async (id: string) => {
	const newToken = generateShareToken();
	const updated = await db
		.update(meetings)
		.set({ shareToken: newToken })
		.where(eq(meetings.id, id))
		.returning();
	return updated[0];
};

// ---- Agenda items ----

export const getAgendaItems = async (
	meetingId: string,
): Promise<AgendaItemFormValues[]> => {
	const rows = await db
		.select()
		.from(agendaItems)
		.where(eq(agendaItems.meetingId, meetingId))
		.orderBy(asc(agendaItems.order), asc(agendaItems.createdAt));
	return rows.map((r) => ({
		...r,
		description: r.description ?? undefined,
		presenterId: r.presenterId ?? null,
		memo: r.memo ?? null,
		linkedTaskId: r.linkedTaskId ?? null,
		linkedQaId: r.linkedQaId ?? null,
		createdAt: r.createdAt ?? new Date(),
		updatedAt: r.updatedAt ?? new Date(),
	}));
};

export const createAgendaItem = async (
	meetingId: string,
	data: AgendaItemFormValues,
) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	// 末尾に追加: 既存項目の最大 order + 1
	const existing = await db
		.select({ order: agendaItems.order })
		.from(agendaItems)
		.where(eq(agendaItems.meetingId, meetingId))
		.orderBy(desc(agendaItems.order))
		.limit(1);
	const nextOrder = (existing[0]?.order ?? -1) + 1;

	const inserted = await db
		.insert(agendaItems)
		.values({
			meetingId,
			order: data.order ?? nextOrder,
			title: data.title,
			description: data.description ?? null,
			status: data.status ?? "not_started",
			presenterId: data.presenterId || null,
			memo: data.memo ?? null,
			linkedTaskId: data.linkedTaskId || null,
			linkedQaId: data.linkedQaId || null,
		})
		.returning();

	if (currentUserId && currentUser) {
		await logAgendaActivity(
			currentUserId,
			currentUser,
			"agenda_create",
			inserted[0]?.id,
			data.title,
			{ meetingId, status: data.status },
		);
	}

	return inserted[0];
};

export const updateAgendaItem = async (
	id: string,
	data: AgendaItemFormValues,
) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	const oldRows = await db
		.select()
		.from(agendaItems)
		.where(eq(agendaItems.id, id));
	const oldData = oldRows[0];

	const updated = await db
		.update(agendaItems)
		.set({
			title: data.title,
			description: data.description ?? null,
			status: data.status ?? "not_started",
			presenterId: data.presenterId || null,
			memo: data.memo ?? null,
			linkedTaskId: data.linkedTaskId || null,
			linkedQaId: data.linkedQaId || null,
		})
		.where(eq(agendaItems.id, id))
		.returning();

	if (currentUserId && currentUser && oldData) {
		await logAgendaActivity(
			currentUserId,
			currentUser,
			"agenda_update",
			id,
			data.title,
			{
				oldData: {
					title: oldData.title,
					status: oldData.status,
					presenterId: oldData.presenterId,
				},
				newData: {
					title: data.title,
					status: data.status,
					presenterId: data.presenterId,
				},
			},
		);
	}

	return updated[0];
};

export const deleteAgendaItem = async (id: string) => {
	const { userId: currentUserId, userName: currentUser } =
		await getCurrentUser();

	const oldRows = await db
		.select()
		.from(agendaItems)
		.where(eq(agendaItems.id, id));
	const oldData = oldRows[0];

	const deleted = await db.delete(agendaItems).where(eq(agendaItems.id, id));

	if (currentUserId && currentUser && oldData) {
		await logAgendaActivity(
			currentUserId,
			currentUser,
			"agenda_delete",
			id,
			oldData.title,
			{ meetingId: oldData.meetingId },
		);
	}

	return deleted;
};

// 並び替え: [{id, order}, ...] を受け取り一括更新
export const reorderAgendaItems = async (
	items: { id: string; order: number }[],
) => {
	await Promise.all(
		items.map((it) =>
			db
				.update(agendaItems)
				.set({ order: it.order })
				.where(eq(agendaItems.id, it.id)),
		),
	);
};
