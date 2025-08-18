import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar, text } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "../users";

export const userActivity = pgTable("user_activity", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	userName: varchar("user_name", { length: 255 }).notNull(),
	action: varchar("action", { length: 255 }).notNull(),
	// 操作対象の詳細情報を追加
	resourceType: varchar("resource_type", { length: 50 }), // "task", "qa", "member", "club" など
	resourceId: varchar("resource_id", { length: 255 }), // 操作対象のID
	resourceName: varchar("resource_name", { length: 255 }), // 操作対象の名前/タイトル
	resourceDetails: text("resource_details"), // 変更内容の詳細（JSON文字列として保存）
	createdAt: timestamp("created_at").defaultNow(),
});

export const userActivityRelations = relations(userActivity, ({ one }) => ({
	user: one(users, {
		fields: [userActivity.userId],
		references: [users.id],
	}),
}));
