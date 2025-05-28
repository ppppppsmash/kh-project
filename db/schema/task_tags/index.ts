import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { tasks } from "../tasks";
import { tags } from "../tags";

export const taskTags = pgTable("task_tags", {
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  // 複合主キー
  pk: primaryKey(table.taskId, table.tagId),
}));
