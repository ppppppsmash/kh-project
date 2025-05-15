import { relations } from "drizzle-orm";
import {
	boolean,
	jsonb,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { leaderTeams } from "../leader_teams";
import { managerTeams } from "../manager_teams";
import { userActivity } from "../user_activity";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	name: varchar("name", { length: 255 }).notNull(),
	image: varchar("image", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	// ロールはsuperadmin, admin, userの3種類
	role: varchar("role", {
		length: 255,
		enum: ["superadmin", "admin", "user"],
	}).default("admin"),
	// プロフィール情報
	department: varchar("department", { length: 255 }),
	position: varchar("position", { length: 255 }),
	hobby: varchar("hobby", { length: 255 }),
	skills: varchar("skills", { length: 255 }).array().default([]),
	skills_message: varchar("skills_message", { length: 255 }).default(""),
	freeText: varchar("free_text", { length: 255 }),
	photoUrl: varchar("photo_url", { length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.notNull()
		.$onUpdate(() => new Date()),
});

export const userRelations = relations(users, ({ many }) => ({
	activities: many(userActivity), // 1:n
	leaderTeams: many(leaderTeams, { relationName: "leader_teams" }), // 1:n
	managerTeams: many(managerTeams, { relationName: "manager_teams" }), // 1:n
}));
