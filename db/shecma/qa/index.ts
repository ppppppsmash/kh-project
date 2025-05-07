import { pgTable, varchar, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const qa = pgTable("qa", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  question: varchar("question", { length: 255 }).notNull(),
  questionCode: varchar("question_code", { length: 255 }).notNull(),
  answer: varchar("answer", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  questionBy: varchar("question_by", { length: 255 }),
  answeredBy: varchar("answered_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
