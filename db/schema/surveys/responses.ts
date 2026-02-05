import {
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { surveys } from "./index";

// アンケート回答（1回の回答セッション）
export const surveyResponses = pgTable("survey_responses", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	surveyId: uuid("survey_id")
		.notNull()
		.references(() => surveys.id, { onDelete: "cascade" }),
	respondentName: varchar("respondent_name", { length: 255 }), // 回答者名（匿名の場合はnull）
	submittedAt: timestamp("submitted_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow(),
});

// アンケート回答項目（各質問への回答）
export const surveyResponseItems = pgTable("survey_response_items", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	responseId: uuid("response_id")
		.notNull()
		.references(() => surveyResponses.id, { onDelete: "cascade" }),
	surveyItemId: uuid("survey_item_id").notNull(), // survey_itemsのID
	answer: text("answer").notNull(), // JSON形式で保存（文字列、配列など）
	createdAt: timestamp("created_at").defaultNow(),
});
