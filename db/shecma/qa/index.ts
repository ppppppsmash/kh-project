import { pgTable, varchar, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const qa = pgTable("qa", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  question: varchar("question", { length: 255 }).notNull(),
  answer: varchar("answer", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});