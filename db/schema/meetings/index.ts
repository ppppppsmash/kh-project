import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { qa } from "../qa";
import { tasks } from "../tasks";
import { users } from "../users";

export const meetings = pgTable("meetings", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	scheduledAt: timestamp("scheduled_at"),
	// status: 予定(scheduled)、進行中(in_progress)、終了(done)
	status: varchar("status", {
		length: 50,
		enum: ["scheduled", "in_progress", "done"],
	})
		.notNull()
		.default("scheduled"),
	isPublic: boolean("is_public").notNull().default(false),
	shareToken: text("share_token").notNull().unique(),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const agendaItems = pgTable("agenda_items", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	meetingId: uuid("meeting_id")
		.notNull()
		.references(() => meetings.id, { onDelete: "cascade" }),
	order: integer("order").notNull().default(0),
	// type: section（セクション見出し・親）/ agenda（議題）/ memo（自由記述ブロック）
	type: varchar("type", { length: 20, enum: ["agenda", "memo", "section"] })
		.notNull()
		.default("agenda"),
	// parentId: セクションに属する場合は親 section の id。null なら top level
	parentId: uuid("parent_id"),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	// status: 未(not_started)、進行中(in_progress)、完了(done) ※ agenda のみ
	status: varchar("status", {
		length: 50,
		enum: ["not_started", "in_progress", "done"],
	})
		.notNull()
		.default("not_started"),
	presenterId: uuid("presenter_id").references(() => users.id, {
		onDelete: "set null",
	}),
	memo: text("memo"),
	linkedTaskId: uuid("linked_task_id").references(() => tasks.id, {
		onDelete: "set null",
	}),
	linkedQaId: uuid("linked_qa_id").references(() => qa.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const meetingRelations = relations(meetings, ({ many, one }) => ({
	agendaItems: many(agendaItems),
	creator: one(users, {
		fields: [meetings.createdBy],
		references: [users.id],
	}),
}));

export const agendaItemRelations = relations(agendaItems, ({ one }) => ({
	meeting: one(meetings, {
		fields: [agendaItems.meetingId],
		references: [meetings.id],
	}),
	presenter: one(users, {
		fields: [agendaItems.presenterId],
		references: [users.id],
	}),
	linkedTask: one(tasks, {
		fields: [agendaItems.linkedTaskId],
		references: [tasks.id],
	}),
	linkedQa: one(qa, {
		fields: [agendaItems.linkedQaId],
		references: [qa.id],
	}),
}));
