import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const members = pgTable("members", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  hobby: varchar("hobby", { length: 255 }).notNull(),
  skills: varchar("skills", { length: 255 }).notNull(),
  freeText: varchar("free_text", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
