import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  title: varchar("title", { length: 255 }).notNull(),
  content: varchar("content", { length: 255 }).notNull(),
  assignee: varchar("assignee", { length: 255 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  progress: varchar("progress", { length: 255 }).notNull(),
  progressDetails: varchar("progress_details", { length: 255 }).notNull(),
  link: varchar("link", { length: 255 }).notNull(),
  notes: varchar("notes", { length: 255 }).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
