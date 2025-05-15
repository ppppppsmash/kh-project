import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "../users";

export const leaderTeams = pgTable("leader_teams", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	leaderId: uuid("leader_id")
		.references(() => users.id)
		.notNull(),
	memberId: uuid("member_id")
		.references(() => users.id)
		.notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.notNull()
		.$onUpdate(() => new Date()),
});
