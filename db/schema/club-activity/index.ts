import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const clubActivity = pgTable("club_activity", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	name: varchar("name", { length: 255 }).notNull(),
	leader: varchar("leader", { length: 255 }).notNull(),
	description: varchar("description", { length: 255 }),
	memberCount: varchar("member_count", { length: 255 }),
	activityType: varchar("activity_type", { length: 255 }),
	status: varchar("status", { length: 255 }).notNull(),
	location: varchar("location", { length: 255 }),
	detail: varchar("detail", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.notNull()
		.$onUpdate(() => new Date()),
});
