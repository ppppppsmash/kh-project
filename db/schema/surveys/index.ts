import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const surveys = pgTable("surveys", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	theme: varchar("theme", { length: 50 }).default("default"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const surveyItems = pgTable("survey_items", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	surveyId: uuid("survey_id")
		.notNull()
		.references(() => surveys.id, { onDelete: "cascade" }),
	question: text("question").notNull(),
	questionType: varchar("question_type", { length: 50 }).notNull(), // text, textarea, select, radio, checkbox
	options: text("options"), // JSON string for select/radio/checkbox options
	isRequired: boolean("is_required").default(false),
	order: varchar("order", { length: 10 }).default("0"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// 回答関連のスキーマもエクスポート
export { surveyResponses, surveyResponseItems } from "./responses";
