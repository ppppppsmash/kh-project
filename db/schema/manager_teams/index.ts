import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "../users";

export const managerTeams = pgTable("manager_teams", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  managerId: uuid("manager_id").references(() => users.id).notNull(),
  leaderId: uuid("leader_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().$onUpdate(() => new Date()),
});
