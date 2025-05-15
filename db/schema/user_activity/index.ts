import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "../users";

export const userActivity = pgTable("user_activity", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	userId: varchar("user_id", { length: 255 })
		.notNull()
		.references(() => users.id),
	userName: varchar("user_name", { length: 255 }).notNull(),
	action: varchar("action", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const userActivityRelations = relations(userActivity, ({ one }) => ({
	user: one(users, {
		fields: [userActivity.userId],
		references: [users.id],
	}),
}));
