import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { relations } from "drizzle-orm";
import { userActivity } from "../user-activity";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	name: varchar("name", { length: 255 }).notNull(),
	image: varchar("image", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	role: varchar("role", { length: 255 }).notNull().default("user"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().$onUpdate(() => new Date()),
});

export const userRelations = relations(users, ({ many }) => ({
  activities: many(userActivity), // 1:n
}));
