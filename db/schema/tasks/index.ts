import {
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { categories } from "../categories";
import { tabs } from "../tabs";

export const tasks = pgTable("tasks", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	taskId: varchar("task_id", { length: 255 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	content: varchar("content", { length: 255 }).notNull(),
	assignee: varchar("assignee", { length: 255 }).notNull(),
	dueDate: timestamp("due_date").notNull(),
	progress: varchar("progress", { length: 255 }).notNull(),
	progressDetails: varchar("progress_details", { length: 255 }),
	link: varchar("link", { length: 255 }).notNull(),
	notes: varchar("notes", { length: 255 }).notNull(),
	categoryId: uuid("category_id")
		.references(() => categories.id),
	tabId: uuid("tab_id")
	.references(() => tabs.id),
	startedAt: timestamp("started_at").notNull(),
	completedAt: timestamp("completed_at"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});
